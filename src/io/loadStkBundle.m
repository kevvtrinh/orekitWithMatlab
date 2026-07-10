function result = loadStkBundle(bundleFolder, options)
%LOADSTKBUNDLE Build a native STK scenario/VDF from an exported bundle.
%
% Requires Windows and an installed STK Desktop. The exported copy of this
% function is standalone and repairs bundle paths if the folder was moved.

arguments
    bundleFolder (1, 1) string = string(pwd)
    options.CreateVdf (1, 1) logical = true
    options.Visible (1, 1) logical = true
    options.LaunchIfMissing (1, 1) logical = true
    options.DryRun (1, 1) logical = false
end

if ~isfolder(bundleFolder)
    error("loadStkBundle:BundleNotFound", ...
        "Bundle folder does not exist: %s", bundleFolder);
end
if ~isAbsolutePath(bundleFolder)
    bundleFolder = fullfile(string(pwd), bundleFolder);
end
manifestFile = fullfile(bundleFolder, "manifest.json");
if ~isfile(manifestFile)
    error("loadStkBundle:ManifestNotFound", ...
        "No manifest.json was found in %s.", bundleFolder);
end
manifest = jsondecode(fileread(manifestFile));
loadTemplate = fullfile(bundleFolder, string(manifest.ConnectFile));
if ~isfile(loadTemplate)
    error("loadStkBundle:ConnectFileNotFound", ...
        "The bundle Connect file is missing: %s", loadTemplate);
end

loadCommands = resolveBundleToken(fileread(loadTemplate), bundleFolder);

result = struct("BundleFolder", bundleFolder, ...
    "LoadCommands", string(loadCommands), ...
    "ScenarioFile", fullfile(bundleFolder, string(manifest.NativeStkScenarioFile)), ...
    "VdfFile", fullfile(bundleFolder, string(manifest.VdfFile)), ...
    "StkProgId", "", "Executed", false);
if options.DryRun
    return;
end
if ~ispc
    error("loadStkBundle:WindowsRequired", ...
        "STK Desktop automation requires Windows.");
end

[application, progId] = connectToStk(options.LaunchIfMissing);
application.Visible = options.Visible;
root = application.Personality2;
try
    currentScenario = root.CurrentScenario;
catch
    currentScenario = [];
end
if ~isempty(currentScenario)
    error("loadStkBundle:ScenarioAlreadyOpen", ...
        "Close the current STK scenario before loading this bundle.");
end

loadFile = writeTemporaryConnect(loadCommands);
loadCleanup = onCleanup(@() deleteIfPresent(loadFile)); %#ok<NASGU>
root.ExecuteCommand(sprintf('ConFile / "%s"', escapeConnectPath(loadFile)));

if options.CreateVdf
    % IAgStkObjectRoot.SaveAs writes a Viewer Data File when the target
    % filename carries the .vdf extension.
    root.SaveAs(char(escapeConnectPath(result.VdfFile)));
end

result.StkProgId = progId;
result.Executed = true;
fprintf("STK scenario created: %s\n", result.ScenarioFile);
if options.CreateVdf
    fprintf("STK Viewer file created: %s\n", result.VdfFile);
end
end

function text = resolveBundleToken(text, bundleFolder)
pathText = escapeConnectPath(bundleFolder);
text = strrep(string(text), "__BUNDLE_DIR__", pathText);
text = char(text);
end

function [application, progId] = connectToStk(launchIfMissing)
progIds = ["STK13.Application", "STK12.Application", "STK11.Application"];
application = [];
progId = "";
for candidate = progIds
    try
        application = actxGetRunningServer(char(candidate));
        progId = candidate;
        break;
    catch
        % Try the next registered STK version.
    end
end
if ~isempty(application)
    return;
end
if ~launchIfMissing
    error("loadStkBundle:StkNotRunning", ...
        "No running STK Desktop instance was found.");
end
lastError = [];
for candidate = progIds
    try
        application = actxserver(char(candidate));
        progId = candidate;
        break;
    catch err
        lastError = err;
    end
end
if isempty(application)
    if isempty(lastError)
        detail = "No registered STK COM server was found.";
    else
        detail = string(lastError.message);
    end
    error("loadStkBundle:StkUnavailable", ...
        "Could not launch STK 11, 12, or 13. %s", detail);
end
end

function filename = writeTemporaryConnect(contents)
filename = string(tempname) + ".connect";
fid = fopen(filename, "w");
if fid < 0
    error("loadStkBundle:CannotWriteTemporaryFile", ...
        "Could not create a temporary Connect file.");
end
cleaner = onCleanup(@() fclose(fid)); %#ok<NASGU>
fprintf(fid, "%s", contents);
end

function pathText = escapeConnectPath(pathValue)
pathText = replace(string(pathValue), "/", "\");
if contains(pathText, '"')
    error("loadStkBundle:UnsupportedQuoteInPath", ...
        "STK bundle paths cannot contain a double quote.");
end
end

function deleteIfPresent(filename)
if isfile(filename)
    delete(filename);
end
end

function tf = isAbsolutePath(pathValue)
pathValue = char(pathValue);
tf = ~isempty(regexp(pathValue, '^[A-Za-z]:[\\/]', 'once')) || ...
    startsWith(pathValue, char([92 92])) || startsWith(pathValue, "/");
end
