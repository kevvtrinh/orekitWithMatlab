function payload = orbitUiDemoScenario(outputFile)
%ORBITUIDEMOSCENARIO Build the demo scenario used by the orbit-ui MATLAB bridge.
%
% payload = orbitUiDemoScenario(outputFile)
%
% Creates a small deterministic scenario (an ISS-like LEO satellite plus a
% sun-synchronous imager against two ground sites), propagates it with the
% Orekit backend, computes ground station access, and writes the result as
% JSON via exportScenarioJson. This is the entry point invoked by the
% apps/orbit-ui Node backend through `matlab -batch`.

arguments
    outputFile (1, 1) string = "orbit-ui-scenario.json"
end

cfg = ScenarioConfig();
cfg.Name = "Orbit UI Demo";
cfg.Epoch = datetime(2026, 7, 5, 0, 0, 0, "TimeZone", "UTC");
cfg.Duration = hours(3);
cfg.TimeStep = seconds(30);

scenario = MissionScenario(cfg);

leo = SatelliteObject.fromKeplerian("ISS-Demo", 6778e3, 0.0007, 51.6, 60, 30, 0);
leo.Color = [0.91 0.64 0.24];
sso = OrbitDesigner.sunSynchronous("SSO-Imager", 700e3, 10.5, cfg.Epoch);
sso.Color = [0.31 0.72 0.82];

denver = GroundStationObject("Denver GS", 39.7392, -104.9903, 1609, 10);
kourou = GroundStationObject("Kourou GS", 5.2360, -52.7686, 9, 5);

scenario = scenario.addObject(leo);
scenario = scenario.addObject(sso);
scenario = scenario.addObject(denver);
scenario = scenario.addObject(kourou);
scenario = scenario.propagate();

pairs = ["ISS-Demo", "Denver GS"; "ISS-Demo", "Kourou GS"; ...
    "SSO-Imager", "Denver GS"; "SSO-Imager", "Kourou GS"];
for k = 1:size(pairs, 1)
    result = computeAccess(scenario, pairs(k, 1), pairs(k, 2));
    fieldName = matlab.lang.makeValidName(pairs(k, 1) + "_to_" + pairs(k, 2));
    scenario.AccessResults.(fieldName) = result;
end

payload = exportScenarioJson(scenario, outputFile);
fprintf("orbitUiDemoScenario: wrote %s (%d satellites, %d access pairs)\n", ...
    outputFile, numel(payload.satellites), numel(payload.accesses));
end
