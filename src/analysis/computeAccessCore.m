function accessResult = computeAccessCore(scenario, sourceName, targetName, options)
%COMPUTEACCESSCORE Implementation behind function and method access APIs.
%
% Optional constraint fields on options (all applied on top of the basic
% elevation/line-of-sight geometry, STK access-constraint style):
%   MinElevationDeg    Override the ground station minimum elevation.
%   MinRangeKm         Reject samples closer than this range.
%   MaxRangeKm         Reject samples farther than this range.
%   GroundLighting     "Any" (default) | "Sunlit" | "Dark" - lighting
%                      condition at the ground end of the link.
%   SatelliteLighting  "Any" (default) | "Sunlit" | "Eclipsed" - lighting
%                      condition of the satellite (source satellite for
%                      satellite-to-satellite pairs).

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

satelliteForLighting = "";
groundForLighting = "";

if isa(source, "SatelliteObject") && isa(target, "GroundStationObject")
    aer = computeAzElRange(source, target, timeVector);
    minElevation = constraintValue(options, "MinElevationDeg", target.MinElevationDeg);
    accessLogical = aer.ElevationDeg >= minElevation;
    accessLogical = accessLogical & applyAzElMask(aer, target);
    satelliteForLighting = source.Name;
    groundForLighting = target.Name;
    sourceForWindow = source.Name;
    targetForWindow = target.Name;

elseif isa(source, "GroundStationObject") && isa(target, "SatelliteObject")
    aer = computeAzElRange(target, source, timeVector);
    minElevation = constraintValue(options, "MinElevationDeg", source.MinElevationDeg);
    accessLogical = aer.ElevationDeg >= minElevation;
    accessLogical = accessLogical & applyAzElMask(aer, source);
    satelliteForLighting = target.Name;
    groundForLighting = source.Name;
    sourceForWindow = source.Name;
    targetForWindow = target.Name;

elseif isa(source, "SatelliteObject") && isa(target, "SatelliteObject")
    aer = satelliteToSatelliteRange(source, target, timeVector);
    accessLogical = computeLineOfSight(source, target, timeVector);
    satelliteForLighting = source.Name;
    sourceForWindow = source.Name;
    targetForWindow = target.Name;

else
    error("computeAccess:UnsupportedPair", ...
        "Access between %s and %s is not supported yet.", ...
        source.ObjectType, target.ObjectType);
end

% Range constraints.
minRangeKm = constraintValue(options, "MinRangeKm", NaN);
maxRangeKm = constraintValue(options, "MaxRangeKm", NaN);
if ~isnan(minRangeKm)
    accessLogical = accessLogical & (aer.RangeKm >= minRangeKm);
end
if ~isnan(maxRangeKm)
    accessLogical = accessLogical & (aer.RangeKm <= maxRangeKm);
end

% Ground lighting constraint.
groundLighting = string(constraintValue(options, "GroundLighting", "Any"));
if ~strcmpi(groundLighting, "Any") && strlength(groundForLighting) > 0
    sunAtSite = computeSunElevation(scenario, groundForLighting);
    switch upper(groundLighting)
        case "SUNLIT"
            accessLogical = accessLogical & sunAtSite.IsDaylight;
        case "DARK"
            accessLogical = accessLogical & ~sunAtSite.IsDaylight;
        otherwise
            error("computeAccess:InvalidGroundLighting", ...
                "GroundLighting must be Any, Sunlit, or Dark.");
    end
end

% Satellite lighting constraint.
satelliteLighting = string(constraintValue(options, "SatelliteLighting", "Any"));
if ~strcmpi(satelliteLighting, "Any") && strlength(satelliteForLighting) > 0
    eclipse = computeEclipse(scenario, satelliteForLighting);
    switch upper(satelliteLighting)
        case "SUNLIT"
            accessLogical = accessLogical & ~eclipse.ShadowLogical;
        case "ECLIPSED"
            accessLogical = accessLogical & eclipse.ShadowLogical;
        otherwise
            error("computeAccess:InvalidSatelliteLighting", ...
                "SatelliteLighting must be Any, Sunlit, or Eclipsed.");
    end
end

accessResult.Constraints = struct( ...
    "MinRangeKm", minRangeKm, "MaxRangeKm", maxRangeKm, ...
    "GroundLighting", groundLighting, "SatelliteLighting", satelliteLighting);
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

function ok = applyAzElMask(aer, groundStation)
%APPLYAZELMASK Terrain/obstruction mask: require elevation above the
% azimuth-dependent minimum in groundStation.AzElMask (columns AzimuthDeg
% ascending in [0, 360) and MinElevationDeg). Empty mask passes everything.
ok = true(height(aer), 1);
mask = groundStation.AzElMask;
if isempty(mask) || height(mask) == 0
    return;
end
maskAz = [mask.AzimuthDeg(:); mask.AzimuthDeg(1) + 360];
maskEl = [mask.MinElevationDeg(:); mask.MinElevationDeg(1)];
minElevation = interp1(maskAz, maskEl, ...
    mod(aer.AzimuthDeg - maskAz(1), 360) + maskAz(1), "linear");
ok = aer.ElevationDeg >= minElevation;
end

function value = constraintValue(options, name, defaultValue)
if isfield(options, name) && ~isempty(options.(name))
    value = options.(name);
else
    value = defaultValue;
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
