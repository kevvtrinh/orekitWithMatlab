function result = saveScenario(scenario, filename, options)
%SAVESCENARIO Save the native scenario and an STK interoperability bundle.
%
% The MAT file remains the authoritative, lossless suite representation.
% By default a sibling <name>_stk folder is also written with STK *.e,
% *.a, *.sp, sensor/mask files, and a loader that can author an STK *.sc
% and Viewer-compatible *.vdf on a machine with STK installed.

arguments
    scenario MissionScenario
    filename
    options.ExportStkBundle (1, 1) logical = true
    options.StkOutputFolder (1, 1) string = ""
    options.StkVersion (1, 1) string = "12.0"
end

filename = string(filename);
[folder, baseName, extension] = fileparts(filename);
if strlength(folder) == 0
    folder = string(pwd);
    filename = fullfile(folder, baseName + extension);
elseif ~isfolder(folder)
    mkdir(folder);
end

scenarioData = scenario.toStruct();
save(filename, "scenarioData");

result = struct("NativeFile", filename, "StkBundle", []);
if options.ExportStkBundle
    stkFolder = options.StkOutputFolder;
    if strlength(strtrim(stkFolder)) == 0
        stkFolder = fullfile(folder, baseName + "_stk");
    end
    result.StkBundle = exportStkScenario(scenario, stkFolder, ...
        "Version", options.StkVersion);
end
end

