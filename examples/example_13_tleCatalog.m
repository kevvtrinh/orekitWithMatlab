%% Example 13: load a TLE catalog (deck access style)
suiteRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(suiteRoot);
startupOrekitSuite();

% Write a small demo catalog; in practice point loadTLEFile at a
% downloaded CelesTrak/Space-Track .tle file.
catalogFile = fullfile(tempdir, "demo_catalog.tle");
writelines([ ...
    "ISS (ZARYA)"
    "1 25544U 98067A   26001.50000000  .00016717  00000-0  10270-3 0  9994"
    "2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.49560532    15"], ...
    catalogFile);

sats = loadTLEFile(catalogFile);
fprintf("Loaded %d satellite(s) from catalog\n", numel(sats));

cfg = ScenarioConfig("Name", "Catalog Demo", "Duration", hours(3), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
for k = 1:numel(sats)
    scenario = scenario.addObject(sats{k});
end
scenario = scenario.addObject(GroundStationObject( ...
    "Denver GS", 39.7392, -104.9903, 1609, 10));
scenario = scenario.propagate();

accessResult = computeAccess(scenario, sats{1}.Name, "Denver GS");
disp(accessResult.AccessWindows);
plotGroundTrack(scenario, sats{1}.Name);
