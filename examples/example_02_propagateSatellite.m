%% Example 02: propagate a satellite
example_01_headlessScenario;

scenario = scenario.propagate();
sat = scenario.getObject("Sat-1");

disp(sat.Ephemeris(1:5, :));

