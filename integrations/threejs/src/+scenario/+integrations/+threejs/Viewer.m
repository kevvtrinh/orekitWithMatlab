classdef Viewer < handle
    %VIEWER MATLAB-owned React and Three.js viewer session.
    %
    % Construction:
    %   viewer = scenario.integrations.threejs.Viewer(study)
    %   viewer = scenario.integrations.threejs.Viewer( ...
    %       study, sunDirectionProvider)
    %   viewer = scenario.integrations.threejs.Viewer( ...
    %       study, sunDirectionProvider, trajectoryProvider)
    %   viewer = scenario.integrations.threejs.Viewer( ...
    %       study, sunDirectionProvider, trajectoryProvider, ...
    %       satelliteStateProvider)
    %   viewer = scenario.integrations.threejs.Viewer( ...
    %       study, sunDirectionProvider, trajectoryProvider, ...
    %       satelliteStateProvider, viewerOptions)
    %
    % The viewer owns a loopback HTTP server and its service timer. MATLAB
    % retains ownership of the supplied Scenario. Browser commands use the
    % Scenario public API; renderer snapshots use ITRF positions in metres.
    % The optional Sun provider is explicitly owned by the viewer composition.

    properties (SetAccess = private)
        Study
        Url
    end

    properties (Access = private)
        LocalServer
        SunDirectionProvider
        TrajectoryProvider
        SatelliteStateProvider
        SceneCache
    end

    methods
        function viewer = Viewer( ...
                study, sunDirectionProvider, trajectoryProvider, ...
                satelliteStateProvider, viewerOptions)
            % Start an offline localhost viewer for a scenario.Scenario.
            % sunDirectionProvider accepts a zoned datetime and returns
            % provider-neutral ECI/ECEF directions. trajectoryProvider accepts
            % an initial state and UTC epochs and returns N-by-3 ECI/ECEF
            % positions. Empty trajectoryProvider produces a static snapshot.
            % satelliteStateProvider accepts classical-element structures and
            % returns an engine-neutral Cartesian initial state. Empty disables
            % browser creation of satellites from orbital elements.
            % viewerOptions.OpenBrowser is a scalar logical (default true).
            % Set it false for automated validation that must not open a user
            % browser. Unknown option fields warn once and are ignored.
            % Invalid scenarios, providers, and unavailable assets raise errors.

            if nargin < 2 || isempty(sunDirectionProvider)
                sunDirectionProvider = ...
                    @scenario.environment.calculateSunDirection;
            end
            if nargin < 3
                trajectoryProvider = [];
            end
            if nargin < 4
                satelliteStateProvider = [];
            end
            if nargin < 5
                viewerOptions = struct();
            end
            viewer.validateScenario(study);
            viewer.validateRequiredProvider( ...
                sunDirectionProvider, "SunProvider");
            viewer.validateOptionalProvider( ...
                trajectoryProvider, "TrajectoryProvider");
            viewer.validateOptionalProvider( ...
                satelliteStateProvider, "SatelliteStateProvider");
            viewerOptions = viewer.resolveOptions(viewerOptions);

            viewer.Study = study;
            viewer.SunDirectionProvider = sunDirectionProvider;
            viewer.TrajectoryProvider = trajectoryProvider;
            viewer.SatelliteStateProvider = satelliteStateProvider;
            viewer.SceneCache = [];
            webRoot = fullfile(viewer.integrationRoot(), "dist");
            commandHandler = @(request) viewer.applyCommand(request);
            viewer.LocalServer = ...
                scenario.integrations.threejs.internal.LocalServer( ...
                    webRoot, commandHandler);
            viewer.Url = viewer.LocalServer.Url;
            viewer.refresh();
            if viewerOptions.OpenBrowser
                web(viewer.Url, "-browser");
            end
        end

        function refresh(viewer)
            % Publish an ITRF renderer snapshot at the Scenario start epoch.

            [sceneData, viewer.SceneCache] = ...
                scenario.integrations.threejs.createSceneData( ...
                    viewer.Study, viewer.SunDirectionProvider, ...
                    viewer.TrajectoryProvider, viewer.SceneCache);
            viewer.LocalServer.setScene(sceneData);
        end

        function close(viewer)
            % Stop only this viewer's timer and loopback socket.

            if ~isempty(viewer.LocalServer) && isvalid(viewer.LocalServer)
                viewer.LocalServer.close();
                delete(viewer.LocalServer);
            end
            viewer.LocalServer = [];
        end

        function delete(viewer)
            % Release viewer-owned transport resources.

            viewer.close();
        end
    end

    methods (Access = private)
        function result = applyCommand(viewer, request)
            % Apply one authoring command through public MATLAB contracts.

            [command, payload] = viewer.parseCommandRequest(request);
            switch command
                case "newScenario"
                    result = viewer.createNewScenario(payload);
                case "saveScenario"
                    result = scenario.createScenarioDefinition(viewer.Study);
                    return
                case "loadScenario"
                    result = viewer.loadScenario(payload);
                case "addSatellite"
                    result = viewer.addSatellite(payload);
                case "addPlace"
                    result = viewer.addPlace(payload);
                otherwise
                    error("ThreeJsViewer:UnknownCommand", ...
                        "Unknown browser command '%s'.", command);
            end
            viewer.refresh();
        end

        function result = createNewScenario(viewer, payload)
            % Replace the active composition with a new empty scenario.

            requiredFields = ["Name", "StartEpochUnix_s", "StopEpochUnix_s"];
            viewer.requireFields(payload, requiredFields, "newScenario");
            startTime = viewer.createUtcDatetime(payload.StartEpochUnix_s);
            stopTime = viewer.createUtcDatetime(payload.StopEpochUnix_s);
            viewer.Study = scenario.Scenario(payload.Name, startTime, stopTime);
            result = struct("scenarioName", viewer.Study.Name);
        end

        function result = loadScenario(viewer, payload)
            % Replace the active composition from a versioned definition.

            viewer.requireFields(payload, "Definition", "loadScenario");
            viewer.Study = ...
                scenario.createScenarioFromDefinition(payload.Definition);
            result = struct("scenarioName", viewer.Study.Name);
        end

        function result = addSatellite(viewer, payload)
            % Create an ITRF state through the explicitly injected provider.

            if isempty(viewer.SatelliteStateProvider)
                error("ThreeJsViewer:SatelliteCreationUnavailable", ...
                    "No satellite-state provider was supplied to this viewer.");
            end
            requiredFields = [ ...
                "Name", "EpochUnix_s", "Altitude_m", "Eccentricity", ...
                "Inclination_deg", "Raan_deg", ...
                "ArgumentOfPerigee_deg", "TrueAnomaly_deg"];
            viewer.requireFields(payload, requiredFields, "addSatellite");
            elements = rmfield(payload, "Name");
            elements.EpochUtc = ...
                viewer.createUtcDatetime(elements.EpochUnix_s);
            elements = rmfield(elements, "EpochUnix_s");
            initialState = viewer.SatelliteStateProvider(elements);
            satellite = viewer.Study.addSatellite(payload.Name, initialState);
            result = struct("name", satellite.Name);
        end

        function result = addPlace(viewer, payload)
            % Add one user-defined WGS84 place through Scenario.

            requiredFields = [ ...
                "Name", "Latitude_deg", "Longitude_deg", "Altitude_m"];
            viewer.requireFields(payload, requiredFields, "addPlace");
            place = viewer.Study.addPlace( ...
                payload.Name, payload.Latitude_deg, ...
                payload.Longitude_deg, payload.Altitude_m);
            result = struct("name", place.Name);
        end

        function [command, payload] = parseCommandRequest(viewer, request)
            % Validate the transport envelope and return its optional payload.

            viewer.validateRequestEnvelope(request);
            command = string(request.command);
            viewer.validateCommand(command);
            payload = struct();
            if isfield(request, "payload") && ~isempty(request.payload)
                payload = request.payload;
            end
            viewer.validatePayload(payload);
        end

        function requireFields(~, payload, requiredFields, command)
            % Produce one actionable diagnostic for incomplete form payloads.

            missingFields = requiredFields(~isfield(payload, requiredFields));
            if ~isempty(missingFields)
                error("ThreeJsViewer:MissingCommandField", ...
                    "Command '%s' is missing field(s): %s.", ...
                    command, strjoin(missingFields, ", "));
            end
        end

        function value = createUtcDatetime(~, epochUnix_s)
            % Convert a finite POSIX epoch into an explicitly zoned datetime.

            validateattributes(epochUnix_s, {'numeric'}, ...
                {'real', 'finite', 'scalar'});
            value = datetime(epochUnix_s, ...
                "ConvertFrom", "posixtime", "TimeZone", "UTC");
        end

        function root = integrationRoot(viewer) %#ok<MANU>
            % Resolve the integration root independently of the current folder.

            classPath = mfilename("fullpath");
            root = fileparts(fileparts(fileparts(fileparts( ...
                fileparts(classPath)))));
        end

        function validateScenario(~, study)
            % Enforce the composition root accepted by this viewer.

            if ~isa(study, "scenario.Scenario")
                error("ThreeJsViewer:InvalidScenario", ...
                    "study must be a scenario.Scenario instance.");
            end
        end

        function validateRequiredProvider(~, provider, providerName)
            % Enforce a required injected function provider.

            if ~isa(provider, "function_handle")
                error("ThreeJsViewer:Invalid" + providerName, ...
                    "%s must be a function handle.", ...
                    lower(extractBefore(providerName, "Provider")) + ...
                    "DirectionProvider");
            end
        end

        function validateOptionalProvider(~, provider, providerName)
            % Enforce the common optional injected-provider contract.

            if ~(isempty(provider) || isa(provider, "function_handle"))
                error("ThreeJsViewer:Invalid" + providerName, ...
                    "%s must be empty or a function handle.", providerName);
            end
        end

        function validateRequestEnvelope(~, request)
            % Enforce the command transport envelope before field access.

            isValid = isstruct(request) && isscalar(request) && ...
                isfield(request, "command");
            if ~isValid
                error("ThreeJsViewer:InvalidCommandRequest", ...
                    "Browser command requests require a command field.");
            end
        end

        function validateCommand(~, command)
            % Enforce a nonempty scalar command identifier.

            isValid = isscalar(command) && ~ismissing(command) && ...
                strlength(command) > 0;
            if ~isValid
                error("ThreeJsViewer:InvalidCommand", ...
                    "Browser command must be nonempty scalar text.");
            end
        end

        function validatePayload(~, payload)
            % Enforce the scalar structure used by all command forms.

            if ~(isstruct(payload) && isscalar(payload))
                error("ThreeJsViewer:InvalidCommandPayload", ...
                    "Browser command payload must be a scalar structure.");
            end
        end

        function options = resolveOptions(~, overrides)
            % Resolve the viewer lifecycle choice in one documented place.

            if isempty(overrides)
                overrides = struct();
            end
            if ~(isstruct(overrides) && isscalar(overrides))
                error("ThreeJsViewer:InvalidOptions", ...
                    "viewerOptions must be a scalar structure or empty.");
            end
            options = struct("OpenBrowser", true);
            knownFields = string(fieldnames(options));
            suppliedFields = string(fieldnames(overrides));
            unknownFields = suppliedFields(~ismember( ...
                suppliedFields, knownFields));
            if ~isempty(unknownFields)
                warning("ThreeJsViewer:UnknownOptions", ...
                    "Ignored unknown viewer option field(s): %s.", ...
                    strjoin(unknownFields, ", "));
            end
            if isfield(overrides, "OpenBrowser") && ...
                    ~isempty(overrides.OpenBrowser)
                options.OpenBrowser = overrides.OpenBrowser;
            end
            validateattributes(options.OpenBrowser, {'logical'}, ...
                {'scalar'});
        end
    end
end
