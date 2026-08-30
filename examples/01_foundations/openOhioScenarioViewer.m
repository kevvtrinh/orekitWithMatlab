function viewer = openOhioScenarioViewer()
%% Section 0: Header & Readme
% SYNTAX
%   viewer = openOhioScenarioViewer()
%**************************************************************************
% PURPOSE
%   - Open the MATLAB-hosted Three.js viewer with the default Ohio scenario.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - viewer (scenario.integrations.threejs.Viewer)
%       MATLAB-owned localhost viewer. Call viewer.close() to stop its server.
%**************************************************************************
% UNITS
%   - The initial snapshot uses ITRF metres and WGS84 geodetic coordinates.
%**************************************************************************

%% Section 1: Create The Default Scenario

study = createOhioScenario();

%% Section 2: Select The Orekit Sun Provider

sunDirectionProvider = @scenario.integrations.orekit.calculateSunDirection;

%% Section 3: Open The Three.js Viewer

viewer = scenario.integrations.threejs.Viewer( ...
    study, sunDirectionProvider);
end
