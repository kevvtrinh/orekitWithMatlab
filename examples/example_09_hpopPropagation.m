%% Example 09: high-precision (HPOP-style) numerical propagation
startupOrekitSuite();

cfg = ScenarioConfig("Name", "HPOP Demo", "Duration", hours(6), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);

% Numerical propagation with 8x8 gravity, sun/moon, drag, and SRP.
sat = SatelliteObject.fromKeplerian("Sat-HPOP", 6878e3, 0.001, 97.5, 0, 0, 0);
sat.PropagatorType = "Numerical";
sat.MassKg = 250;
sat.DragAreaM2 = 2.5;
sat.SRPAreaM2 = 2.5;
sat.ForceModel = ForceModelOptions("GravityDegree", 16, "GravityOrder", 16);

% The same orbit on a two-body propagator, for comparison.
kep = SatelliteObject.fromKeplerian("Sat-Kep", 6878e3, 0.001, 97.5, 0, 0, 0);

scenario = scenario.addObject(sat);
scenario = scenario.addObject(kep);
scenario = scenario.propagate();

hpopEphem = scenario.getObject("Sat-HPOP").Ephemeris;
kepEphem = scenario.getObject("Sat-Kep").Ephemeris;
separationKm = sqrt((hpopEphem.X_m - kepEphem.X_m).^2 + ...
    (hpopEphem.Y_m - kepEphem.Y_m).^2 + ...
    (hpopEphem.Z_m - kepEphem.Z_m).^2) / 1000.0;

fprintf("Perturbation-driven separation after %s: %.2f km\n", ...
    string(cfg.Duration), separationKm(end));

elements = computeOrbitalElements(scenario, "Sat-HPOP");
plotOrbitalElements(elements, "Sat-HPOP");
