classdef LocalServer < handle
    %LOCALSERVER Loopback HTTP transport using MATLAB's bundled Java runtime.

    properties (SetAccess = private)
        Url
    end

    properties (Access = private)
        Root
        ServerSocket
        ServiceTimer
        CommandHandler
        SceneData = struct()
        Revision = 0
    end

    methods
        function server = LocalServer(root, commandHandler)
            % Bind an available loopback port and begin servicing requests.

            server.Root = string(root);
            server.CommandHandler = commandHandler;
            if ~isfolder(server.Root)
                error("ThreeJsServer:MissingBuild", ...
                    "Compiled React viewer not found: %s", server.Root);
            end

            loopback = java.net.InetAddress.getByName("127.0.0.1");
            server.ServerSocket = java.net.ServerSocket(0, 16, loopback);
            server.ServerSocket.setSoTimeout(1);
            port = server.ServerSocket.getLocalPort();
            server.Url = "http://127.0.0.1:" + string(port) + "/";
            server.ServiceTimer = timer( ...
                "ExecutionMode", "fixedSpacing", ...
                "Period", 0.05, ...
                "BusyMode", "drop", ...
                "TimerFcn", @(~, ~) server.serveOneRequest());
            start(server.ServiceTimer);
        end

        function setScene(server, sceneData)
            % Store one complete renderer snapshot and update its revision.

            server.SceneData = sceneData;
            server.Revision = server.Revision + 1;
        end

        function close(server)
            % Stop the service timer and close this listening socket.

            if ~isempty(server.ServiceTimer) && isvalid(server.ServiceTimer)
                stop(server.ServiceTimer);
                delete(server.ServiceTimer);
            end
            server.ServiceTimer = [];
            if ~isempty(server.ServerSocket) && ...
                    ~server.ServerSocket.isClosed()
                server.ServerSocket.close();
            end
            server.ServerSocket = [];
        end

        function delete(server)
            % Release server resources.

            server.close();
        end
    end

    methods (Access = private)
        function serveOneRequest(server)
            % Accept at most one request to keep MATLAB responsive.

            try
                client = server.ServerSocket.accept();
            catch acceptError
                if contains(string(acceptError.message), "timed out")
                    return
                end
                warning("ThreeJsServer:AcceptFailed", "%s", ...
                    acceptError.message);
                return
            end

            cleanup = onCleanup(@() client.close());
            try
                request = server.readRequest(client);
                response = server.routeRequest(request);
                server.writeResponse(client, request.Method, response);
            catch requestError
                warning("ThreeJsServer:RequestFailed", "%s", ...
                    requestError.message);
            end
        end

        function request = readRequest(server, client)
            % Parse one small HTTP/1.1 request and its optional UTF-8 body.

            client.setSoTimeout(2000);
            reader = java.io.BufferedReader(java.io.InputStreamReader( ...
                client.getInputStream(), "UTF-8"));
            requestParts = split(string(reader.readLine()));
            if numel(requestParts) < 2
                error("ThreeJsServer:MalformedRequest", ...
                    "The HTTP request line is incomplete.");
            end
            request = struct( ...
                "Method", upper(requestParts(1)), ...
                "Path", server.normalizePath(requestParts(2)), ...
                "Body", "");
            contentLength = server.readContentLength(reader);
            if contentLength > 0
                request.Body = server.readBody(reader, contentLength);
            end
        end

        function contentLength = readContentLength(server, reader) %#ok<INUSD>
            % Read headers and return the declared body character count.

            contentLength = 0;
            headerLine = string(reader.readLine());
            while strlength(headerLine) > 0
                if startsWith(lower(headerLine), "content-length:")
                    contentLength = str2double(strtrim( ...
                        extractAfter(headerLine, ":")));
                end
                headerLine = string(reader.readLine());
            end
        end

        function body = readBody(server, reader, contentLength) %#ok<INUSD>
            % Read the ASCII JSON commands accepted by this integration.

            characters = blanks(contentLength);
            for characterIndex = 1:contentLength
                value = reader.read();
                if value < 0
                    error("ThreeJsServer:TruncatedBody", ...
                        "The HTTP request body ended unexpectedly.");
                end
                characters(characterIndex) = char(value);
            end
            body = string(characters);
        end

        function response = routeRequest(server, request)
            % Route fixed API endpoints before static-file handling.

            routeKey = request.Method + " " + request.Path;
            switch routeKey
                case "GET /api/health"
                    response = server.jsonResponse(200, ...
                        struct("status", "ok"));
                case "GET /api/scene"
                    payload = struct( ...
                        "revision", server.Revision, ...
                        "scene", server.SceneData);
                    response = server.jsonResponse(200, payload);
                case "POST /api/command"
                    response = server.commandResponse(request.Body);
                otherwise
                    response = server.staticResponse(request);
            end
        end

        function response = commandResponse(server, requestBody)
            % Execute one MATLAB command and preserve identified diagnostics.

            try
                commandRequest = jsondecode(requestBody);
                result = server.CommandHandler(commandRequest);
                response = server.jsonResponse(200, struct( ...
                    "status", "ok", ...
                    "result", result));
            catch commandError
                payload = struct( ...
                    "status", "error", ...
                    "message", string(commandError.message), ...
                    "identifier", string(commandError.identifier));
                response = server.jsonResponse(400, payload);
            end
        end

        function response = staticResponse(server, request)
            % Serve only files contained by the compiled React root.

            if ~any(request.Method == ["GET", "HEAD"])
                response = server.textResponse(405, "Method not allowed");
                return
            end
            relativePath = extractAfter(request.Path, 1);
            if strlength(relativePath) == 0
                relativePath = "index.html";
            end
            if contains(relativePath, "..")
                response = server.textResponse(403, "Forbidden");
                return
            end
            filePath = fullfile(server.Root, ...
                replace(relativePath, "/", filesep));
            if ~isfile(filePath)
                response = server.textResponse(404, "Not found");
                return
            end
            response = struct( ...
                "Status", 200, ...
                "ContentType", server.contentType(filePath), ...
                "Body", server.readBytes(filePath));
        end

        function writeResponse(server, client, method, response)
            % Write a complete connection-closing HTTP response.

            header = sprintf([ ...
                'HTTP/1.1 %d %s\r\n' ...
                'Content-Type: %s\r\n' ...
                'Content-Length: %d\r\n' ...
                'Cache-Control: no-store\r\n' ...
                'Connection: close\r\n\r\n'], ...
                response.Status, server.statusReason(response.Status), ...
                response.ContentType, numel(response.Body));
            output = client.getOutputStream();
            output.write(server.toJavaBytes( ...
                unicode2native(header, "UTF-8")));
            if method ~= "HEAD" && ~isempty(response.Body)
                output.write(server.toJavaBytes(response.Body));
            end
            output.flush();
        end
    end

    methods (Static, Access = private)
        function path = normalizePath(target)
            % Remove query parameters and percent-decode a request target.

            target = extractBefore(string(target) + "?", "?");
            path = string(java.net.URLDecoder.decode(target, "UTF-8"));
        end

        function response = jsonResponse(status, value)
            % Encode a MATLAB value as UTF-8 JSON.

            response = struct( ...
                "Status", status, ...
                "ContentType", "application/json; charset=utf-8", ...
                "Body", unicode2native(jsonencode(value), "UTF-8"));
        end

        function response = textResponse(status, value)
            % Encode a diagnostic as UTF-8 plain text.

            response = struct( ...
                "Status", status, ...
                "ContentType", "text/plain; charset=utf-8", ...
                "Body", unicode2native(value, "UTF-8"));
        end

        function bytes = readBytes(filePath)
            % Read one compiled asset without changing its bytes.

            fileId = fopen(filePath, "r");
            if fileId < 0
                error("ThreeJsServer:StaticReadFailed", ...
                    "Could not open static asset: %s", filePath);
            end
            cleanup = onCleanup(@() fclose(fileId));
            bytes = fread(fileId, Inf, "*uint8")';
        end

        function value = contentType(filePath)
            % Return the MIME type needed by compiled Vite assets.

            [~, ~, extension] = fileparts(filePath);
            types = containers.Map( ...
                {'.html', '.js', '.css', '.json'}, ...
                {'text/html; charset=utf-8', ...
                 'text/javascript; charset=utf-8', ...
                 'text/css; charset=utf-8', ...
                 'application/json; charset=utf-8'});
            if isKey(types, lower(extension))
                value = types(lower(extension));
            else
                value = "application/octet-stream";
            end
        end

        function reason = statusReason(status)
            % Return a reason phrase for this server's small status set.

            reasons = containers.Map( ...
                {200, 400, 403, 404, 405}, ...
                {'OK', 'Bad Request', 'Forbidden', 'Not Found', ...
                 'Method Not Allowed'});
            if isKey(reasons, status)
                reason = reasons(status);
            else
                reason = 'Status';
            end
        end

        function bytes = toJavaBytes(bytes)
            % Preserve unsigned byte values through Java's signed byte array.

            bytes = typecast(reshape(uint8(bytes), 1, []), "int8");
        end
    end
end
