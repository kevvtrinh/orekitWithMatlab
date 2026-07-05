%% Example 14: downlink RF link budget over an access
suiteRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(suiteRoot);
startupOrekitSuite();

cfg = ScenarioConfig("Name", "Link Demo", "Duration", hours(6), "TimeStep", seconds(30));
scenario = MissionScenario(cfg);
scenario = scenario.addObject(SatelliteObject.fromKeplerian( ...
    "Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0));
scenario = scenario.addObject(GroundStationObject( ...
    "Denver GS", 39.7392, -104.9903, 1609, 10));
scenario = scenario.propagate();

accessResult = computeAccess(scenario, "Sat-1", "Denver GS");

% X-band downlink: 5 W transmitter, 42 dBi ground antenna, 50 Mbps.
linkResult = computeLinkBudget(accessResult, struct( ...
    "FrequencyHz", 8.2e9, ...
    "TransmitPowerW", 5, ...
    "TransmitGainDb", 6, ...
    "ReceiveGainDb", 42, ...
    "SystemNoiseTemperatureK", 220, ...
    "DataRateBps", 50e6, ...
    "LossesDb", 3, ...
    "RequiredEbN0Db", 4.5));

fprintf("EIRP: %.1f dBW\n", linkResult.Summary.EIRPdBW);
fprintf("Worst margin in access: %.1f dB\n", linkResult.Summary.WorstMarginDb);
fprintf("Link closes %.1f%% of access time\n", linkResult.Summary.LinkClosesPercent);

inAccess = linkResult.Table(linkResult.Table.HasAccess, :);
figure("Name", "Link Margin");
plot(inAccess.Time, inAccess.MarginDb, ".");
grid on; xlabel("Time"); ylabel("Eb/N0 margin (dB)");
title("Downlink margin during access");
