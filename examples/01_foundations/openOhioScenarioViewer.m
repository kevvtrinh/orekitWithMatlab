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
%   - Trajectory positions use ECI/ECEF metres. Epochs use UTC. The default
%     playback rate is 240 scenario seconds per real second.
%**************************************************************************

%% Section 1: Create The Default Scenario

study = createOhioScenario();

%% Section 2: Select The Orekit Providers

sunDirectionProvider = @scenario.integrations.orekit.calculateSunDirection;
trajectoryProvider = ...
    @scenario.integrations.orekit.propagateSatelliteTrajectory;
satelliteStateProvider = ...
    @scenario.integrations.orekit.createSatelliteStateFromKeplerian;

%% Section 3: Open The Three.js Viewer

viewer = scenario.integrations.threejs.Viewer( ...
    study, sunDirectionProvider, trajectoryProvider, satelliteStateProvider);
end
