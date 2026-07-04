function tests = testScenarioConfig
tests = functiontests(localfunctions);
end

function testStopTimeFromDuration(testCase)
cfg = ScenarioConfig();
cfg.Epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
cfg.Duration = hours(2);
verifyEqual(testCase, cfg.getStopTime(), cfg.Epoch + hours(2));
end

function testTimeVector(testCase)
cfg = ScenarioConfig();
cfg.Epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
cfg.Duration = minutes(2);
cfg.TimeStep = seconds(60);
timeVector = cfg.getTimeVector();
verifyEqual(testCase, numel(timeVector), 3);
verifyEqual(testCase, timeVector(end), cfg.Epoch + minutes(2));
end

