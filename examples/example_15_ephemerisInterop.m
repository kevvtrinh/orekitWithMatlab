%% Example 15: CCSDS OEM export/import and deck access
startupOrekitSuite();

cfg = ScenarioConfig("Name", "Interop Demo", "Duration", hours(3), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
scenario = scenario.addObject(SatelliteObject.fromKeplerian( ...
    "Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0));
scenario = scenario.addObject(SatelliteObject.fromKeplerian( ...
    "Sat-2", 7000e3, 0.001, 51.6, 180, 0, 0));
scenario = scenario.addObject(GroundStationObject( ...
    "Denver GS", 39.7392, -104.9903, 1609, 10));
scenario = scenario.propagate();

% Export Sat-1's trajectory as a CCSDS OEM file (readable by STK/GMAT).
exportOEM(scenario, "Sat-1", "sat1.oem");

% Re-import it as an ephemeris-driven satellite; propagation resamples
% the file states instead of running a propagator.
imported = loadOEMFile("sat1.oem", "Sat-1-FromFile");
scenario = scenario.addObject(imported);
scenario = scenario.propagate();

% Deck access: all satellites against one ground station in one call.
deck = computeDeckAccess(scenario, "Denver GS", struct("MinElevationDeg", 10));
disp(deck.Summary);
disp(deck.AccessWindows);
