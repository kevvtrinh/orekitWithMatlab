function deckResult = computeDeckAccess(scenario, targetName, options)
%COMPUTEDECKACCESS Access from every satellite in the scenario to one object.
%
% deckResult = computeDeckAccess(scenario, "Denver GS")
% deckResult = computeDeckAccess(scenario, "Denver GS", struct("MinElevationDeg", 10))
%
% STK "Deck Access" style: pairs each propagated satellite (typically loaded
% with loadTLEFile) against the target and returns the merged, time-sorted
% window list. options takes the same constraint fields as computeAccess.
%
% deckResult fields: TargetName, SatelliteNames, Results (struct per
% satellite), AccessWindows (all windows sorted by start time), Summary.

arguments
    scenario MissionScenario
    targetName
    options struct = struct()
end

targetName = string(targetName);
satelliteNames = strings(0, 1);
for k = 1:numel(scenario.Objects)
    candidate = scenario.Objects{k};
    if isa(candidate, "SatelliteObject") && candidate.IsPropagated && ...
            ~strcmp(string(candidate.Name), targetName)
        satelliteNames(end + 1, 1) = string(candidate.Name); %#ok<AGROW>
    end
end
if isempty(satelliteNames)
    error("computeDeckAccess:NoSatellites", ...
        "No propagated satellites are available for deck access.");
end

results = struct();
allWindows = {};
totalSeconds = zeros(numel(satelliteNames), 1);
for k = 1:numel(satelliteNames)
    result = computeAccessCore(scenario, satelliteNames(k), targetName, options);
    results.(matlab.lang.makeValidName(satelliteNames(k))) = result;
    allWindows{end + 1} = result.AccessWindows; %#ok<AGROW>
    totalSeconds(k) = result.Duration;
end

windows = vertcat(allWindows{:});
if ~isempty(windows)
    windows = sortrows(windows, "StartTime");
end

deckResult = struct();
deckResult.TargetName = targetName;
deckResult.SatelliteNames = satelliteNames;
deckResult.Results = results;
deckResult.AccessWindows = windows;
deckResult.Summary = table(satelliteNames, totalSeconds, ...
    'VariableNames', {'Satellite', 'TotalAccessSeconds'});
end
