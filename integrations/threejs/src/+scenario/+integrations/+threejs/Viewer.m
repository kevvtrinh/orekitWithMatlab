classdef Viewer < handle
    %VIEWER MATLAB-owned React and Three.js viewer session.
    %
    % Construction:
    %   viewer = scenario.integrations.threejs.Viewer(study)
    %   viewer = scenario.integrations.threejs.Viewer( ...
    %       study, sunDirectionProvider)
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
    end

    methods
        function viewer = Viewer(study, sunDirectionProvider)
            % Start an offline localhost viewer for a scenario.Scenario.
            % sunDirectionProvider accepts a zoned datetime and returns
            % provider-neutral ECI/ECEF directions. Invalid scenarios,
            % providers, and unavailable web assets raise errors.

            if ~isa(study, "scenario.Scenario")
                error("ThreeJsViewer:InvalidScenario", ...
                    "study must be a scenario.Scenario instance.");
            end
            if nargin < 2 || isempty(sunDirectionProvider)
                sunDirectionProvider = ...
                    @scenario.environment.calculateSunDirection;
            end
            if ~isa(sunDirectionProvider, "function_handle")
                error("ThreeJsViewer:InvalidSunProvider", ...
                    "sunDirectionProvider must be a function handle.");
            end

            viewer.Study = study;
            viewer.SunDirectionProvider = sunDirectionProvider;
            webRoot = fullfile(viewer.integrationRoot(), "dist");
            commandHandler = @(command) viewer.applyCommand(command);
            viewer.LocalServer = ...
                scenario.integrations.threejs.internal.LocalServer( ...
                    webRoot, commandHandler);
            viewer.Url = viewer.LocalServer.Url;
            viewer.refresh();
            web(viewer.Url, "-browser");
        end

        function refresh(viewer)
            % Publish an ITRF renderer snapshot at the Scenario start epoch.

            sceneData = ...
                scenario.integrations.threejs.createSceneData( ...
                    viewer.Study, viewer.SunDirectionProvider);
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
        function applyCommand(viewer, command)
            % Apply one display command through the Scenario public API.

            switch string(command)
                case "addSatellite"
                    viewer.addDefaultSatellite();
                case "addPlace"
                    viewer.addDefaultOhioPlace();
                otherwise
                    warning("ThreeJsViewer:UnknownCommand", ...
                        "Ignored unknown browser command '%s'.", command);
                    return
            end
            viewer.refresh();
        end

        function addDefaultSatellite(viewer)
            % Add a deterministic ITRF snapshot through Scenario.

            satelliteCount = numel(viewer.Study.Satellites);
            satelliteName = "Satellite " + string(satelliteCount + 1);
            angle_rad = deg2rad(mod(35 * satelliteCount, 360));
            radius_m = 7000000;
            speed_m_s = 7546;
            initialState = struct( ...
                "epoch", viewer.Study.StartTime, ...
                "frame", "ITRF", ...
                "position_m", radius_m * ...
                    [cos(angle_rad), 0, sin(angle_rad)], ...
                "velocity_m_s", speed_m_s * ...
                    [-sin(angle_rad), 0, cos(angle_rad)]);
            viewer.Study.addSatellite(satelliteName, initialState);
        end

        function addDefaultOhioPlace(viewer)
            % Add the first-slice Ohio coordinate through Scenario.

            placeCount = numel(viewer.Study.Places);
            placeName = "Ohio Place " + string(placeCount + 1);
            viewer.Study.addPlace(placeName, 40, -83, 250);
        end

        function root = integrationRoot(viewer) %#ok<MANU>
            % Resolve the integration root independently of the current folder.

            classPath = mfilename("fullpath");
            root = fileparts(fileparts(fileparts(fileparts( ...
                fileparts(classPath)))));
        end
    end
end
