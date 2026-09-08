function session = launchOrbitHtmlUI(varargin)
%LAUNCHORBITHTMLUI Open the React/Three.js Orbit Console from MATLAB.
%
% session = launchOrbitHtmlUI()
% session = launchOrbitHtmlUI("Port", 8322, "OpenBrowser", false)
% session = launchOrbitHtmlUI("NodeExecutable", "C:\Program Files\nodejs\node.exe")
%
% Options: Port (8322), OpenBrowser (true), NodeExecutable (auto-discovered),
% BuildIfNeeded (true). Node.js 18 or later is required. Missing dependencies
% are installed with npm ci when npm is available; missing or stale frontend
% output is built with Vite. Set BuildIfNeeded=false to require prepared files.
%
% The local Node bridge runs in the background and uses this MATLAB
% installation for analysis jobs. MATLAB remains available after startup.
% session.URL and session.LogFile identify the browser and server log.
% session.IsRunning() checks the process; session.Stop() shuts it down.
% Repeating the launcher on the same port reuses its running session.

parser = inputParser;
parser.addParameter("Port", 8322, @(value) isnumeric(value) && ...
    isscalar(value) && isreal(value) && isfinite(value) && ...
    value == fix(value) && value >= 1 && value <= 65535);
parser.addParameter("OpenBrowser", true, @(value) islogical(value) && isscalar(value));
parser.addParameter("NodeExecutable", "", @(value) ...
    (isstring(value) && isscalar(value)) || (ischar(value) && isrow(value)) || isempty(value));
parser.addParameter("BuildIfNeeded", true, @(value) islogical(value) && isscalar(value));
parser.parse(varargin{:});
options = parser.Results;
if ~usejava("jvm")
    error("launchOrbitHtmlUI:JavaRequired", "This launcher requires MATLAB's Java runtime.");
end

repositoryRoot = fileparts(fileparts(mfilename("fullpath")));
appRoot = fullfile(repositoryRoot, "apps", "orbit-ui");
if ~isfile(fullfile(appRoot, "server", "index.js"))
    error("launchOrbitHtmlUI:MissingApp", "Orbit Console is missing at %s.", appRoot);
end
url = sprintf("http://127.0.0.1:%d/", options.Port);

% Retain process ownership even when called without an output argument.
persistent sessions
if isempty(sessions)
    sessions = {};
end
for sessionIndex = 1:numel(sessions)
    existing = sessions{sessionIndex};
    if existing.Port == options.Port && existing.IsRunning()
        session = existing;
        openConsole(session.URL, options.OpenBrowser);
        return;
    end
end
assertPortAvailable(options.Port);

nodeExecutable = findNode(string(options.NodeExecutable));
environment = struct("PATH", fileparts(nodeExecutable) + pathsep + string(getenv("PATH")));
setupLog = string(tempname) + "-orbit-ui-setup.log";
runCommand([nodeExecutable, "--version"], appRoot, environment, setupLog, 15);
versionText = strtrim(string(fileread(setupLog)));
tokens = regexp(char(versionText), '^v(\d+)\.', 'tokens', 'once');
if isempty(tokens) || str2double(tokens{1}) < 18
    error("launchOrbitHtmlUI:UnsupportedNode", ...
        "Node.js 18 or later is required; '%s' reports '%s'.", nodeExecutable, versionText);
end
prepareFrontend(appRoot, nodeExecutable, environment, setupLog, options.BuildIfNeeded);

matlabExecutable = fullfile(matlabroot, "bin", "matlab");
if ispc
    matlabExecutable = matlabExecutable + ".exe";
end
environment.MATLAB_EXE = matlabExecutable;
environment.ORBIT_UI_PORT = string(options.Port);
environment.ORBIT_UI_MANAGED = "1";
logFile = string(tempname) + "-orbit-ui-server.log";
process = startProcess([nodeExecutable, fullfile(appRoot, "server", "index.js")], ...
    appRoot, environment, logFile);
startupComplete = java.util.concurrent.atomic.AtomicBoolean(false);
startupCleanup = onCleanup(@() cleanupFailedStartup(process, startupComplete));
waitForServer(process, url, repositoryRoot, logFile);
session = struct("URL", string(url), "Port", options.Port, ...
    "Process", process, "LogFile", logFile, "NodeExecutable", nodeExecutable, ...
    "IsRunning", @() logical(process.isAlive()), "Stop", @() stopProcess(process));
sessions{end + 1} = session;
startupComplete.set(true);
fprintf("Orbit Console: %s\n", url);
fprintf("Server log: %s\n", logFile);
fprintf("MATLAB is available. Use session.Stop() to stop a returned session.\n");
openConsole(url, options.OpenBrowser);
end

function cleanupFailedStartup(process, startupComplete)
% The Java guard outlives MATLAB workspace teardown and Ctrl+C unwinding.
if ~startupComplete.get()
    stopProcess(process);
end
end

function executable = findNode(override)
% Resolve executables directly instead of constructing shell commands.
if strlength(override) > 0 && isfile(override)
    executable = string(java.io.File(char(override)).getCanonicalPath());
    return;
end
name = "node";
if ispc
    name = "node.exe";
end
if strlength(override) > 0
    name = override;
end
directories = split(string(getenv("PATH")), pathsep);
if strlength(override) == 0
    if ispc
        directories = [directories; fullfile(string(getenv("ProgramFiles")), "nodejs"); ...
            fullfile(string(getenv("LOCALAPPDATA")), "Programs", "nodejs")];
    else
        directories = [directories; "/usr/local/bin"; "/opt/homebrew/bin"; "/usr/bin"];
    end
end
for directoryIndex = 1:numel(directories)
    directory = strip(strtrim(directories(directoryIndex)), 'both', '"');
    candidate = fullfile(directory, name);
    if strlength(directory) > 0 && isfile(candidate)
        executable = string(java.io.File(char(candidate)).getCanonicalPath());
        return;
    end
end
error("launchOrbitHtmlUI:NodeNotFound", ...
    "Install Node.js 18 or later, restart MATLAB, or provide " + ...
    "launchOrbitHtmlUI('NodeExecutable','full path to node').");
end

function prepareFrontend(appRoot, nodeExecutable, environment, logFile, allowBuild)
% npm's JS entry point avoids platform-specific .cmd/shell quoting entirely.
required = ["express/package.json", "react/package.json", "react-dom/package.json", ...
    "three/package.json", "vite/bin/vite.js", "@vitejs/plugin-react/package.json"];
hasDependencies = true;
for fileIndex = 1:numel(required)
    hasDependencies = hasDependencies && isfile(fullfile(appRoot, "node_modules", required(fileIndex)));
end
if ~hasDependencies
    if ~allowBuild
        error("launchOrbitHtmlUI:MissingDependencies", ...
            "Run npm ci and npm run build in %s, or use BuildIfNeeded=true.", appRoot);
    end
    nodeDirectory = fileparts(nodeExecutable);
    npmCandidates = [fullfile(nodeDirectory, "node_modules", "npm", "bin", "npm-cli.js"); ...
        fullfile(nodeDirectory, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"); ...
        "/usr/share/nodejs/npm/bin/npm-cli.js"];
    npmExecutable = "";
    for candidateIndex = 1:numel(npmCandidates)
        if isfile(npmCandidates(candidateIndex))
            npmExecutable = npmCandidates(candidateIndex);
            break;
        end
    end
    if strlength(npmExecutable) == 0
        error("launchOrbitHtmlUI:NpmNotFound", ...
            "Dependencies are missing and this Node installation has no npm-cli.js. " + ...
            "Install Node.js with npm, or run npm ci and npm run build in %s.", appRoot);
    end
    fprintf("Installing Orbit Console dependencies. Log: %s\n", logFile);
    runCommand([nodeExecutable, npmExecutable, "ci", "--no-audit", "--no-fund"], ...
        appRoot, environment, logFile, 600);
end
indexFile = fullfile(appRoot, "dist", "index.html");
needsBuild = ~isfile(indexFile) || ~hasDependencies;
if ~needsBuild
    built = dir(indexFile);
    sources = [dir(fullfile(appRoot, "src", "**", "*")); ...
        dir(fullfile(appRoot, "public", "**", "*")); ...
        dir(fullfile(appRoot, "index.html")); dir(fullfile(appRoot, "vite.config.js")); ...
        dir(fullfile(appRoot, "package.json")); dir(fullfile(appRoot, "package-lock.json"))];
    sources = sources(~[sources.isdir]);
    needsBuild = any([sources.datenum] > built.datenum);
end
if needsBuild
    if ~allowBuild
        error("launchOrbitHtmlUI:FrontendBuildRequired", ...
            "Frontend output is missing or stale. Run npm run build in %s.", appRoot);
    end
    fprintf("Building Orbit Console. Log: %s\n", logFile);
    runCommand([nodeExecutable, fullfile(appRoot, "node_modules", "vite", "bin", "vite.js"), ...
        "build"], appRoot, environment, logFile, 180);
end
end

function process = startProcess(commandArguments, workingDirectory, environment, logFile)
% Redirect output to a file so a background child cannot block on pipe buffers.
command = java.util.ArrayList();
for argumentIndex = 1:numel(commandArguments)
    command.add(char(commandArguments(argumentIndex)));
end
builder = java.lang.ProcessBuilder(command);
builder.directory(java.io.File(char(workingDirectory)));
builder.redirectErrorStream(true);
builder.redirectOutput(java.io.File(char(logFile)));
variables = builder.environment();
names = fieldnames(environment);
for variableIndex = 1:numel(names)
    variables.put(names{variableIndex}, char(environment.(names{variableIndex})));
end
process = builder.start();
end

function runCommand(commandArguments, workingDirectory, environment, logFile, timeoutSeconds)
% Initial setup may take time; Ctrl+C still cleans up its child process.
process = startProcess(commandArguments, workingDirectory, environment, logFile);
cleanup = onCleanup(@() stopProcess(process));
started = tic;
while process.isAlive()
    if toc(started) > timeoutSeconds
        error("launchOrbitHtmlUI:SetupTimeout", ...
            "Setup exceeded %.0f seconds. See %s.", timeoutSeconds, logFile);
    end
    pause(0.1);
end
if process.exitValue() ~= 0
    error("launchOrbitHtmlUI:SetupFailed", "Setup failed. See %s.", logFile);
end
end

function assertPortAvailable(port)
% Check the requested loopback port without taking over another process.
socket = java.net.Socket();
cleanup = onCleanup(@() socket.close());
try
    socket.connect(java.net.InetSocketAddress("127.0.0.1", int32(port)), int32(250));
catch
    return;
end
error("launchOrbitHtmlUI:PortInUse", ...
    "Port %d is already in use. Stop that server or choose another Port.", port);
end

function waitForServer(process, url, repositoryRoot, logFile)
% Readiness requires this repository's API, not merely an open TCP socket.
started = tic;
while toc(started) < 30
    if ~process.isAlive()
        error("launchOrbitHtmlUI:ServerExited", "Orbit Console exited. See %s.", logFile);
    end
    try
        health = webread(url + "api/health", weboptions("Timeout", 1));
        matches = isstruct(health) && isfield(health, "ok") && health.ok && ...
            isfield(health, "repoRoot") && ...
            strcmpi(char(java.io.File(char(health.repoRoot)).getCanonicalPath()), ...
            char(java.io.File(char(repositoryRoot)).getCanonicalPath()));
        if matches
            return;
        end
    catch
        % The process may be listening before Express finishes registering.
    end
    pause(0.1);
end
error("launchOrbitHtmlUI:ServerTimeout", "Orbit Console did not become ready. See %s.", logFile);
end

function stopProcess(process)
% A managed bridge forwards graceful shutdown to its MATLAB worker.
if ~process.isAlive()
    return;
end
try
    stream = process.getOutputStream();
    stream.write(int8(unicode2native(sprintf('shutdown\n'), "UTF-8")));
    stream.flush();
catch
    % A process that failed during setup may already have closed stdin.
end
started = tic;
while process.isAlive() && toc(started) < 5
    pause(0.05);
end
if process.isAlive()
    process.destroy();
end
end

function openConsole(url, shouldOpen)
% Browser failures leave the healthy server available at its printed URL.
if shouldOpen
    try
        web(url, "-browser");
    catch exception
        warning("launchOrbitHtmlUI:BrowserUnavailable", ...
            "Open %s in a browser. %s", url, exception.message);
    end
end
end
