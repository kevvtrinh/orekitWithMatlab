function exportEphemeris(scenario, folder)
%EXPORTEPHEMERIS Export propagated satellite ephemerides to CSV files.

if ~isfolder(folder)
    mkdir(folder);
end

for k = 1:numel(scenario.Objects)
    obj = scenario.Objects{k};
    if isa(obj, "SatelliteObject") && ~isempty(obj.Ephemeris)
        filename = fullfile(folder, matlab.lang.makeValidName(obj.Name) + "_ephemeris.csv");
        writetable(obj.Ephemeris, filename);
    end
end
end

