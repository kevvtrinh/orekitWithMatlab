function slewSeconds = sensorReturnSlewSeconds(scenario, row)
%SENSORRETURNSLEWSECONDS Return-home slew duration for one schedule row.
%
% slewSeconds = sensorReturnSlewSeconds(scenario, row)
%
% The angle between where the sensor is aiming at the task's StopTime
% (resolveSensorPointing, so point tracks and area scans both end at their
% real final aim point) and the sensor's home boresight at that instant,
% converted to a duration with the sensor's own slew rate/acceleration
% limits. scenario.SensorSchedule must already contain the schedule the row
% came from. Falls back to the row's lead-in SlewTimeSeconds when the final
% aim direction cannot be resolved.

arguments
    scenario MissionScenario
    row (1, :) table
end

fallback = 0;
if ismember("SlewTimeSeconds", row.Properties.VariableNames) && ...
        isfinite(row.SlewTimeSeconds(1))
    fallback = max(row.SlewTimeSeconds(1), 0);
end
slewSeconds = fallback;

try
    platformName = string(row.PlatformName(1));
    sensorName = string(row.SensorName(1));
    parent = scenario.getObject(platformName);
    sensor = parent.getSensor(sensorName);
    stopTime = row.StopTime(1);
    pointing = resolveSensorPointing(scenario, platformName, sensorName, stopTime);
    if any(~isfinite(pointing.BoresightEcef))
        return
    end
    home = sensor.getBoresightVector(stopTime, scenario);
    candidate = sensor.computeSlewTime(pointing.BoresightEcef, home);
    if isfinite(candidate) && candidate >= 0
        slewSeconds = candidate;
    end
catch
    % Keep the lead-in fallback: a missing object or unpropagated parent
    % should not sink the whole export.
end
end
