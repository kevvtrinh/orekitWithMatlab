function accessResult = computeAccessCore(scenario, sourceName, targetName, options)
%COMPUTEACCESSCORE Implementation behind function and method access APIs.

arguments
    scenario MissionScenario
    sourceName
    targetName
    options struct = struct()
end

source = scenario.getObject(sourceName);
target = scenario.getObject(targetName);
timeVector = scenario.Config.getTimeVector();

accessResult = struct();
accessResult.SourceName = string(source.Name);
accessResult.TargetName = string(target.Name);
accessResult.SourceType = string(source.ObjectType);
accessResult.TargetType = string(target.ObjectType);
accessResult.ScenarioEpoch = scenario.Config.Epoch;
accessResult.TimeVector = timeVector;
accessResult.Metadata = options;

if isa(source, "SatelliteObject") && isa(target, "GroundStationObject")
    aer = computeAzElRange(source, target, timeVector);
    accessLogical = aer.ElevationDeg >= target.MinElevationDeg;
    sourceForWindow = source.Name;
    targetForWindow = target.Name;

elseif isa(source, "GroundStationObject") && isa(target, "SatelliteObject")
    aer = computeAzElRange(target, source, timeVector);
    accessLogical = aer.ElevationDeg >= source.MinElevationDeg;
    sourceForWindow = source.Name;
    targetForWindow = target.Name;

elseif isa(source, "SatelliteObject") && isa(target, "SatelliteObject")
    aer = satelliteToSatelliteRange(source, target, timeVector);
    accessLogical = computeLineOfSight(source, target, timeVector);
    sourceForWindow = source.Name;
    targetForWindow = target.Name;

else
    error("computeAccess:UnsupportedPair", ...
        "Access between %s and %s is not supported yet.", ...
        source.ObjectType, target.ObjectType);
end

accessResult.AccessLogical = accessLogical;
accessResult.AccessWindows = buildContactPlan(timeVector, accessLogical, ...
    aer.ElevationDeg, aer.RangeKm, sourceForWindow, targetForWindow);
accessResult.Azimuth = aer.AzimuthDeg;
accessResult.Elevation = aer.ElevationDeg;
accessResult.Range = aer.RangeKm;
accessResult.Duration = sum(accessResult.AccessWindows.DurationSeconds);

if any(accessLogical)
    accessResult.MaxElevation = max(aer.ElevationDeg(accessLogical), [], "omitnan");
    accessResult.MinRange = min(aer.RangeKm(accessLogical), [], "omitnan");
else
    accessResult.MaxElevation = NaN;
    accessResult.MinRange = NaN;
end
end

function aer = satelliteToSatelliteRange(source, target, timeVector)
n = numel(timeVector);
az = nan(n, 1);
el = nan(n, 1);
rangeKm = nan(n, 1);
for k = 1:n
    p1 = source.getECI(timeVector(k));
    p2 = target.getECI(timeVector(k));
    rangeKm(k) = norm(p2 - p1) / 1000.0;
end
aer = table(timeVector(:), az, el, rangeKm, ...
    'VariableNames', {'Time', 'AzimuthDeg', 'ElevationDeg', 'RangeKm'});
end
