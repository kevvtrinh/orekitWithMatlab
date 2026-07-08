function stats = orbitStaticUiServe(varargin)
%ORBITSTATICUISERVE Localhost HTTP server for the static orbit UI (no Node).
%
% stats = orbitStaticUiServe("Root", rootDir, ...)
%
% Serves apps/orbit-static-ui and its /api endpoints over plain HTTP using
% only the Java runtime that ships with MATLAB (java.net.ServerSocket) - no
% Node, npm, or toolboxes. The server binds to 127.0.0.1 only and handles
% requests synchronously on the MATLAB thread; while a /api/run-* request
% propagates a scenario, other requests simply wait.
%
% The accept loop wakes every 250 ms so Ctrl+C stops the server cleanly
% (the socket is closed by onCleanup). Routing lives in orbitStaticUiRequest.
%
% Options:
%   Root        - static file root (required), e.g. <repo>/apps/orbit-static-ui
%   Port        - TCP port on 127.0.0.1 (default 8321)
%   MaxRequests - stop after this many requests (default Inf; used by tests)
%   Quiet       - suppress per-request logging (default false)
%
% Normally started through matlab/launchOrbitStaticUi.m.

parser = inputParser;
parser.addParameter("Root", "", @(v) strlength(string(v)) > 0);
parser.addParameter("Port", 8321, @(v) isnumeric(v) && isscalar(v) && v > 0);
parser.addParameter("MaxRequests", Inf, @(v) isnumeric(v) && isscalar(v) && v > 0);
parser.addParameter("Quiet", false, @(v) islogical(v) && isscalar(v));
parser.parse(varargin{:});
opts = parser.Results;

config = struct( ...
    "Root", string(opts.Root), ...
    "LiveDir", string(fullfile(opts.Root, "data", "live")), ...
    "SampleFile", string(fullfile(opts.Root, "data", "sample-scenario.json")));
if ~isfolder(config.Root)
    error("orbitStaticUi:MissingRoot", ...
        "Static UI root not found: %s", config.Root);
end

loopback = java.net.InetAddress.getByName("127.0.0.1");
try
    server = java.net.ServerSocket(opts.Port, 16, loopback);
catch bindError
    error("orbitStaticUi:PortBusy", ...
        "Cannot bind 127.0.0.1:%d (%s). Is another server running? " + ...
        "Pass a different port: launchOrbitStaticUi(""Port"", %d).", ...
        opts.Port, bindError.message, opts.Port + 1);
end
closeServer = onCleanup(@() server.close());
server.setSoTimeout(250);   % wake regularly so Ctrl+C can interrupt

stats = struct("Requests", 0, "Errors", 0);
while stats.Requests < opts.MaxRequests
    try
        client = server.accept();
    catch acceptError
        if contains(acceptError.message, "SocketTimeoutException") || ...
                contains(acceptError.message, "timed out")
            drawnow limitrate   % let Ctrl+C and UI events through
            continue
        end
        break   % socket closed (Ctrl+C cleanup) or fatal accept error
    end
    ticId = tic;
    try
        request = readRequest(client);
        if isempty(request.Method)
            client.close();
            continue   % connection opened but no request (e.g. speculative)
        end
        response = orbitStaticUiRequest(request, config);
        writeResponse(client, request, response);
        stats.Requests = stats.Requests + 1;
        if ~opts.Quiet
            fprintf("[orbit-static-ui] %-4s %-24s -> %d (%.0f ms)\n", ...
                request.Method, request.Path, response.Status, ...
                1000 * toc(ticId));
        end
    catch handlerError
        stats.Errors = stats.Errors + 1;
        if ~opts.Quiet
            fprintf(2, "[orbit-static-ui] request failed: %s\n", ...
                handlerError.message);
        end
    end
    try
        client.close();
    catch
        % already closed by the peer
    end
end
end

% -------------------------------------------------------------------------

function request = readRequest(client)
% Parse one HTTP/1.1 request from the socket into Method / Path / Body.
MAX_HEADER_BYTES = 32 * 1024;
MAX_BODY_BYTES = 8 * 1024 * 1024;

client.setSoTimeout(8000);
stream = java.io.BufferedInputStream(client.getInputStream());

headerBytes = readUntilBlankLine(stream, MAX_HEADER_BYTES);
request = struct("Method", '', "Path", '', "Body", '');
if isempty(headerBytes)
    return
end
headerText = native2unicode(headerBytes, "UTF-8");
lines = strsplit(headerText, "\r\n");
requestLine = strsplit(strtrim(lines{1}));
if numel(requestLine) < 2
    return
end
request.Method = upper(requestLine{1});
request.Path = decodePath(requestLine{2});

contentLength = 0;
for k = 2:numel(lines)
    line = lines{k};
    if startsWith(lower(line), "content-length:")
        contentLength = str2double(strtrim(extractAfter(line, ":")));
    end
end
if isfinite(contentLength) && contentLength > 0
    if contentLength > MAX_BODY_BYTES
        error("orbitStaticUi:BodyTooLarge", ...
            "Request body of %d bytes exceeds the limit.", contentLength);
    end
    request.Body = native2unicode(readExactly(stream, contentLength), "UTF-8");
end
end

function bytes = readUntilBlankLine(stream, maxBytes)
% Read until the CRLFCRLF that terminates the header block.
bytes = zeros(1, 0, "uint8");
trailer = zeros(1, 4, "uint8");
while numel(bytes) < maxBytes
    value = stream.read();
    if value < 0
        break
    end
    bytes(end + 1) = uint8(value); %#ok<AGROW>
    trailer = [trailer(2:4), uint8(value)];
    if isequal(trailer, uint8([13 10 13 10]))
        bytes = bytes(1:end - 4);
        return
    end
end
if numel(bytes) >= maxBytes
    error("orbitStaticUi:HeaderTooLarge", "Request header exceeds %d bytes.", maxBytes);
end
end

function bytes = readExactly(stream, count)
% readNBytes (Java 11+) hands the buffer back to MATLAB in one call; older
% MATLAB Java runtimes fall back to a per-byte loop (bodies here are small).
try
    raw = stream.readNBytes(count);
    bytes = reshape(typecast(raw, "uint8"), 1, []);
    return
catch
    % readNBytes unavailable - fall through
end
bytes = zeros(1, count, "uint8");
for k = 1:count
    value = stream.read();
    if value < 0
        error("orbitStaticUi:TruncatedBody", ...
            "Connection closed after %d of %d body bytes.", k - 1, count);
    end
    bytes(k) = uint8(value);
end
end

function path = decodePath(target)
% Strip the query string and percent-decode the path.
target = char(target);
queryStart = strfind(target, "?");
if ~isempty(queryStart)
    target = target(1:queryStart(1) - 1);
end
path = char(java.net.URLDecoder.decode(target, "UTF-8"));
end

function writeResponse(client, request, response)
reasons = containers.Map( ...
    {200, 204, 400, 403, 404, 405, 409, 500}, ...
    {'OK', 'No Content', 'Bad Request', 'Forbidden', 'Not Found', ...
     'Method Not Allowed', 'Conflict', 'Internal Server Error'});
status = response.Status;
if isKey(reasons, status)
    reason = reasons(status);
else
    reason = 'Status';
end

body = response.Body;
header = sprintf('HTTP/1.1 %d %s\r\n', status, reason);
header = [header sprintf('Content-Type: %s\r\n', char(response.ContentType))]; %#ok<AGROW>
header = [header sprintf('Content-Length: %d\r\n', numel(body))]; %#ok<AGROW>
header = [header sprintf('Connection: close\r\n')]; %#ok<AGROW>
if startsWith(string(request.Path), "/api/")
    header = [header sprintf('Cache-Control: no-store\r\n')]; %#ok<AGROW>
end
% No CORS headers on purpose: the bridge serves the UI itself, so all real
% traffic is same-origin, and staying silent keeps the localhost API
% unreachable from pages other sites serve. A file:// copy of the console
% therefore runs in offline sample mode (documented in the app README).
header = [header sprintf('\r\n')];

out = client.getOutputStream();
out.write(toJavaBytes(unicode2native(header, "UTF-8")));
if ~isempty(body) && ~strcmpi(request.Method, 'HEAD')
    out.write(toJavaBytes(body));
end
out.flush();
end

function bytes = toJavaBytes(bytes)
% Preserve uint8 values 128..255 when passing bytes to Java's signed byte[].
bytes = reshape(uint8(bytes), 1, []);
bytes = typecast(bytes, "int8");
end
