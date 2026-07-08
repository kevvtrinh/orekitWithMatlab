function response = orbitStaticUiRequest(request, config)
%ORBITSTATICUIREQUEST Route one HTTP request for the static orbit UI bridge.
%
% response = orbitStaticUiRequest(request, config)
%
% Pure request -> response mapping for the no-Node mission console
% (apps/orbit-static-ui). orbitStaticUiServe handles the sockets and calls
% this for every request, which keeps the routing logic testable without
% opening a port (see src/tests/testOrbitStaticUiBridge.m).
%
% request fields:
%   Method - "GET" | "POST" | "PUT" | "OPTIONS" | ...
%   Path   - decoded request path without the query string, e.g. "/api/health"
%   Body   - request body as char ('' when absent)
%
% config fields (see orbitStaticUiConfig local function in orbitStaticUiServe):
%   Root       - static file root (apps/orbit-static-ui)
%   LiveDir    - writable dir for MATLAB-produced JSON (Root/data/live)
%   SampleFile - bundled fallback payload (Root/data/sample-scenario.json)
%
% response fields: Status (double), ContentType (string), Body (uint8 row).
%
% API endpoints (JSON):
%   GET  /api/health        bridge liveness + environment info
%   GET  /api/scenario      latest MATLAB payload, or the bundled sample
%   GET  /api/spec          stored editable spec (404 until one is saved)
%   PUT  /api/spec          store a spec JSON document
%   POST /api/run-demo      run orbitUiDemoScenario (synchronous)
%   POST /api/run-scenario  run orbitUiRunScenario on the posted spec
% Anything else is served from Root as a static file (GET only).

arguments
    request (1, 1) struct
    config (1, 1) struct
end

method = upper(string(request.Method));
path = string(request.Path);

try
    if path == "/api/health"
        response = handleHealth(method, config);
    elseif path == "/api/scenario"
        response = handleScenario(method, config);
    elseif path == "/api/spec"
        response = handleSpec(method, request, config);
    elseif path == "/api/run-demo"
        response = handleRunDemo(method, config);
    elseif path == "/api/run-scenario"
        response = handleRunScenario(method, request, config);
    elseif startsWith(path, "/api/")
        response = jsonError(404, "Unknown API endpoint: " + path);
    elseif method == "GET" || method == "HEAD"
        response = serveStatic(path, config);
    else
        response = jsonError(405, "Method " + method + " is not supported here.");
    end
catch serverError
    response = jsonError(500, string(serverError.message));
end
end

% -------------------------------------------------------------------------
% API handlers
% -------------------------------------------------------------------------

function response = handleHealth(method, config)
if method ~= "GET"
    response = jsonError(405, "Use GET for /api/health.");
    return
end
info = struct( ...
    "ok", true, ...
    "server", "orbit-static-ui-matlab-bridge", ...
    "matlabRelease", string(version("-release")), ...
    "jvm", usejava("jvm"), ...
    "bridgeFunctions", ~isempty(which("orbitUiDemoScenario")) ...
        && ~isempty(which("orbitUiRunScenario")), ...
    "liveScenario", isfile(liveScenarioFile(config)), ...
    "timeUtc", string(datetime("now", "TimeZone", "UTC", ...
        "Format", "yyyy-MM-dd'T'HH:mm:ss'Z'")));
response = jsonResponse(200, jsonencode(info));
end

function response = handleScenario(method, config)
if method ~= "GET"
    response = jsonError(405, "Use GET for /api/scenario.");
    return
end
% Embed the payload file verbatim so the browser sees exactly what
% exportScenarioJson wrote (re-encoding through jsondecode/jsonencode can
% flip one-element arrays into scalars).
liveFile = liveScenarioFile(config);
if isfile(liveFile)
    response = wrappedScenarioResponse("matlab", fileread(liveFile));
elseif isfile(config.SampleFile)
    response = wrappedScenarioResponse("sample", fileread(config.SampleFile));
else
    response = jsonError(404, "No scenario data available (sample file missing).");
end
end

function response = wrappedScenarioResponse(source, scenarioJson)
body = ['{"source":"', char(source), '","scenario":', strtrim(scenarioJson), '}'];
response = jsonResponse(200, body);
end

function response = handleSpec(method, request, config)
specFile = fullfile(config.LiveDir, "spec.json");
if method == "GET"
    if isfile(specFile)
        response = jsonResponse(200, ['{"spec":', strtrim(fileread(specFile)), '}']);
    else
        response = jsonError(404, ...
            "No spec stored yet. PUT /api/spec or POST /api/run-scenario first.");
    end
elseif method == "PUT"
    specJson = specJsonFromBody(request.Body);
    ensureDir(config.LiveDir);
    writeText(specFile, specJson);
    response = jsonResponse(200, ['{"spec":', specJson, '}']);
else
    response = jsonError(405, "Use GET or PUT for /api/spec.");
end
end

function response = handleRunDemo(method, config)
if method ~= "POST"
    response = jsonError(405, "Use POST for /api/run-demo.");
    return
end
ensureDir(config.LiveDir);
liveFile = liveScenarioFile(config);
orbitUiDemoScenario(liveFile);   % synchronous: propagates with Orekit
response = wrappedScenarioResponse("matlab", fileread(liveFile));
end

function response = handleRunScenario(method, request, config)
if method ~= "POST"
    response = jsonError(405, "Use POST for /api/run-scenario.");
    return
end
specJson = specJsonFromBody(request.Body);
ensureDir(config.LiveDir);
runSpecFile = fullfile(config.LiveDir, "spec-run.json");
writeText(runSpecFile, specJson);
writeText(fullfile(config.LiveDir, "spec.json"), specJson);
liveFile = liveScenarioFile(config);
orbitUiRunScenario(runSpecFile, liveFile);   % synchronous: propagates with Orekit
response = wrappedScenarioResponse("matlab", fileread(liveFile));
end

% Accepts either a bare spec document or a {"spec": ...} wrapper and returns
% the spec JSON text. Bare documents pass through verbatim so MATLAB's JSON
% round trip cannot reshape them; only the wrapper form is re-encoded.
function specJson = specJsonFromBody(body)
bodyText = strtrim(char(body));
if isempty(bodyText)
    error("orbitStaticUi:EmptyBody", "Request body must contain spec JSON.");
end
decoded = jsondecode(bodyText);   % also validates the JSON syntax
if isstruct(decoded) && isfield(decoded, "spec")
    specJson = char(jsonencode(decoded.spec));
else
    specJson = bodyText;
end
end

% -------------------------------------------------------------------------
% Static files
% -------------------------------------------------------------------------

function response = serveStatic(path, config)
relative = char(path);
if strcmp(relative, '/')
    relative = '/index.html';
end
% Normalize and refuse anything that escapes the static root.
if contains(relative, "..")
    response = jsonError(403, "Path traversal is not allowed.");
    return
end
candidate = java.io.File(char(config.Root), relative(2:end));
canonical = string(candidate.getCanonicalPath());
rootCanonical = string(java.io.File(char(config.Root)).getCanonicalPath());
if ~startsWith(canonical, rootCanonical)
    response = jsonError(403, "Path traversal is not allowed.");
    return
end
if ~isfile(canonical)
    response = struct("Status", 404, "ContentType", "text/plain; charset=utf-8", ...
        "Body", toBytes("404 Not Found: " + path));
    return
end
fid = fopen(canonical, "rb");
bytes = fread(fid, Inf, "uint8=>uint8").';
fclose(fid);
response = struct("Status", 200, "ContentType", mimeType(canonical), "Body", bytes);
end

function type = mimeType(filePath)
[~, ~, ext] = fileparts(char(filePath));
switch lower(ext)
    case ".html", type = "text/html; charset=utf-8";
    case ".css",  type = "text/css; charset=utf-8";
    case {".js", ".mjs"}, type = "text/javascript; charset=utf-8";
    case ".json", type = "application/json; charset=utf-8";
    case ".svg",  type = "image/svg+xml";
    case ".png",  type = "image/png";
    case {".jpg", ".jpeg"}, type = "image/jpeg";
    case ".ico",  type = "image/x-icon";
    case ".txt",  type = "text/plain; charset=utf-8";
    otherwise,    type = "application/octet-stream";
end
end

% -------------------------------------------------------------------------
% Helpers
% -------------------------------------------------------------------------

function file = liveScenarioFile(config)
file = fullfile(config.LiveDir, "scenario.json");
end

function response = jsonResponse(status, body)
response = struct("Status", status, ...
    "ContentType", "application/json; charset=utf-8", ...
    "Body", toBytes(body));
end

function response = jsonError(status, message)
response = jsonResponse(status, jsonencode(struct("error", string(message))));
end

function bytes = toBytes(text)
bytes = unicode2native(char(text), "UTF-8");
bytes = reshape(bytes, 1, []);
end

function ensureDir(dirPath)
if ~isfolder(dirPath)
    mkdir(dirPath);
end
end

function writeText(filePath, text)
fid = fopen(filePath, "w", "n", "UTF-8");
if fid < 0
    error("orbitStaticUi:WriteFailed", "Cannot write %s", filePath);
end
cleaner = onCleanup(@() fclose(fid));
fwrite(fid, unicode2native(char(text), "UTF-8"), "uint8");
end
