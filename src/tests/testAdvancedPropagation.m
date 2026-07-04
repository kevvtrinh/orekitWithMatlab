function tests = testAdvancedPropagation
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testNumericalTwoBodyMatchesKeplerian(testCase)
scenario = localScenario(minutes(10));
sat = SatelliteObject.fromKeplerian("Sat-Num", 7000e3, 0.001, 51.6, 0, 0, 0);
sat.PropagatorType = "Numerical";
sat.ForceModel = ForceModelOptions.twoBody();
scenario = scenario.addObject(sat);
scenario = scenario.addObject(SatelliteObject.fromKeplerian( ...
    "Sat-Kep", 7000e3, 0.001, 51.6, 0, 0, 0));
scenario = scenario.propagate();

numEphem = scenario.getObject("Sat-Num").Ephemeris;
kepEphem = scenario.getObject("Sat-Kep").Ephemeris;
positionError = sqrt((numEphem.X_m - kepEphem.X_m).^2 + ...
    (numEphem.Y_m - kepEphem.Y_m).^2 + (numEphem.Z_m - kepEphem.Z_m).^2);
verifyLessThan(testCase, max(positionError), 200);
end

function testHpopDefaultsProduceEphemeris(testCase)
scenario = localScenario(minutes(10));
sat = SatelliteObject.fromKeplerian("Sat-HPOP", 7000e3, 0.001, 51.6, 0, 0, 0);
sat.PropagatorType = "HPOP";
scenario = scenario.addObject(sat);
scenario = scenario.propagate();
ephemeris = scenario.getObject("Sat-HPOP").Ephemeris;
verifyEqual(testCase, height(ephemeris), numel(scenario.Config.getTimeVector()));
verifyTrue(testCase, all(isfinite(ephemeris.X_m)));
end

function testEcksteinHechlerProducesEphemeris(testCase)
scenario = localScenario(minutes(10));
sat = SatelliteObject.fromKeplerian("Sat-EH", 7000e3, 0.001, 51.6, 0, 0, 0);
sat.PropagatorType = "EcksteinHechler";
scenario = scenario.addObject(sat);
scenario = scenario.propagate();
verifyTrue(testCase, scenario.getObject("Sat-EH").IsPropagated);
end

function testAlongTrackBurnRaisesOrbit(testCase)
scenario = localScenario(minutes(20));
sat = SatelliteObject.fromKeplerian("Sat-Burn", 7000e3, 0.001, 51.6, 0, 0, 0);
burnTime = scenario.Config.Epoch + minutes(10);
sat = sat.addManeuver(ImpulsiveManeuver("Raise", burnTime, "TNW", [100 0 0]));
scenario = scenario.addObject(sat);
scenario = scenario.propagate();

elements = computeOrbitalElements(scenario, "Sat-Burn");
smaBefore = elements.SemiMajorAxisMeters(2);
smaAfter = elements.SemiMajorAxisMeters(end);
verifyGreaterThan(testCase, smaAfter - smaBefore, 50e3);
end

function testOrbitalElementsRecoverKeplerianInputs(testCase)
scenario = localScenario(minutes(10));
sat = SatelliteObject.fromKeplerian("Sat-Elems", 7000e3, 0.01, 51.6, 40, 30, 0);
scenario = scenario.addObject(sat);
scenario = scenario.propagate();

elements = computeOrbitalElements(scenario, "Sat-Elems");
verifyEqual(testCase, elements.SemiMajorAxisMeters(1), 7000e3, "RelTol", 1e-6);
verifyEqual(testCase, elements.Eccentricity(1), 0.01, "AbsTol", 1e-6);
verifyEqual(testCase, elements.InclinationDeg(1), 51.6, "AbsTol", 1e-6);
verifyEqual(testCase, elements.RAANDeg(1), 40, "AbsTol", 1e-6);
end

function scenario = localScenario(duration)
cfg = ScenarioConfig("Duration", duration, "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
end
