%% Example 12: impulsive maneuvers - Hohmann orbit raise
startupOrekitSuite();

cfg = ScenarioConfig("Name", "Maneuver Demo", "Duration", hours(6), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);

sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.0, 51.6, 0, 0, 0);

% Size the transfer, then attach the two along-track burns.
plan = ManeuverPlanner.hohmann(7000e3, 7500e3);
fprintf("Hohmann 7000 -> 7500 km: dv1=%.1f m/s, dv2=%.1f m/s, transfer=%.1f min\n", ...
    plan.DV1mps, plan.DV2mps, plan.TransferTimeSeconds / 60);

burnStart = cfg.Epoch + hours(1);
maneuvers = ManeuverPlanner.hohmannManeuvers(burnStart, 7000e3, 7500e3, "Raise");
sat = sat.addManeuver(maneuvers{1});
sat = sat.addManeuver(maneuvers{2});

scenario = scenario.addObject(sat);
scenario = scenario.propagate();

disp(scenario.getObject("Sat-1").listManeuvers());
elements = computeOrbitalElements(scenario, "Sat-1");
plotOrbitalElements(elements, "Sat-1");
fprintf("Final semi-major axis: %.1f km\n", elements.SemiMajorAxisMeters(end) / 1000);
