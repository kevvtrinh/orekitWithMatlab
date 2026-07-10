function result = exportStkScenario(scenario, outputFolder, options)
%EXPORTSTKSCENARIO Export an STK interchange bundle for a mission scenario.
%
% The bundle contains documented STK external files and Connect commands.
% Running its loadStkBundle.m helper in an STK-equipped MATLAB session
% creates a native *.sc and, optionally, a Viewer-compatible *.vdf.

arguments
    scenario MissionScenario
    outputFolder
    options.Version (1, 1) string = "12.0"
end

scenario.Config.validate();
outputFolder = string(outputFolder);
if strlength(strtrim(outputFolder)) == 0
    error("exportStkScenario:MissingOutputFolder", ...
        "An STK bundle output folder is required.");
end
if ~isfolder(outputFolder)
    mkdir(outputFolder);
end

subfolders = struct( ...
    "Ephemeris", fullfile(outputFolder, "ephemeris"), ...
    "Attitude", fullfile(outputFolder, "attitude"), ...
    "Sensors", fullfile(outputFolder, "sensors"), ...
    "Masks", fullfile(outputFolder, "masks"), ...
    "Tables", fullfile(outputFolder, "tables"));
folderNames = fieldnames(subfolders);
for k = 1:numel(folderNames)
    if ~isfolder(subfolders.(folderNames{k}))
        mkdir(subfolders.(folderNames{k}));
    end
end

[scenarioName, ~] = uniqueStkName(scenario.Config.Name, strings(0, 1));
warnings = strings(0, 1);
files = strings(0, 1);
objectRecords = emptyObjectRecords();
objectInstances = {};
usedByClass = containers.Map("KeyType", "char", "ValueType", "any");

for k = 1:numel(scenario.Objects)
    object = scenario.Objects{k};
    stkClass = stkClassFor(object);
    if strlength(stkClass) == 0
        if ~isa(object, "SensorObject")
            warnings(end + 1, 1) = "Unsupported object type skipped: " + ...
                string(object.ObjectType) + "/" + string(object.Name); %#ok<AGROW>
        end
        continue;
    end
    key = char(lower(stkClass));
    if isKey(usedByClass, key)
        usedNames = string(usedByClass(key));
    else
        usedNames = strings(0, 1);
    end
    [stkName, usedNames] = uniqueStkName(object.Name, usedNames);
    usedByClass(key) = usedNames;

    record = struct("OriginalName", string(object.Name), ...
        "StkName", stkName, "ObjectType", string(object.ObjectType), ...
        "StkClass", stkClass, "EphemerisFile", "", ...
        "AttitudeFile", "", "AzElMaskFile", "", "Notes", "");

    if isa(object, "SatelliteObject")
        if isempty(object.Ephemeris)
            record.Notes = "Unpropagated; STK loader creates the object without an external state.";
            warnings(end + 1, 1) = "Satellite '" + string(object.Name) + ...
                "' was not propagated; no .e or .a file was written."; %#ok<AGROW>
        else
            ephemerisRelative = normalizedRelative(fullfile("ephemeris", stkName + ".e"));
            attitudeRelative = normalizedRelative(fullfile("attitude", stkName + ".a"));
            exportStkEphemeris(scenario, object.Name, ...
                fullfile(outputFolder, ephemerisRelative), "Version", options.Version);
            exportStkAttitude(scenario, object.Name, ...
                fullfile(outputFolder, attitudeRelative), "Version", options.Version);
            record.EphemerisFile = ephemerisRelative;
            record.AttitudeFile = attitudeRelative;
            record.Notes = "Attitude is synthesized from the suite body-frame convention.";
            files = [files; ephemerisRelative; attitudeRelative]; %#ok<AGROW>
        end
    end

    if isprop(object, "AzElMask") && ~isempty(object.AzElMask) && ...
            height(object.AzElMask) > 0
        maskRelative = normalizedRelative(fullfile("masks", stkName + ".aem"));
        exportStkAzElMask(object.AzElMask, fullfile(outputFolder, maskRelative), ...
            "Version", options.Version);
        record.AzElMaskFile = maskRelative;
        files(end + 1, 1) = maskRelative; %#ok<AGROW>
    end

    objectRecords(end + 1, 1) = record; %#ok<AGROW>
    objectInstances{end + 1, 1} = object; %#ok<AGROW>
end

[sensorRecords, sensorInstances, sensorFiles, sensorWarnings] = ...
    exportSensors(scenario, objectRecords, objectInstances, outputFolder, ...
    subfolders.Sensors, options.Version);
files = [files; sensorFiles];
warnings = [warnings; sensorWarnings];

sensorCsv = normalizedRelative(fullfile("tables", "sensor_definitions.csv"));
exportSensorDefinitions(scenario, fullfile(outputFolder, sensorCsv));
files(end + 1, 1) = sensorCsv;
if ~isempty(scenario.SensorSchedule) && height(scenario.SensorSchedule) > 0
    scheduleCsv = normalizedRelative(fullfile("tables", "sensor_schedule.csv"));
    exportSensorSchedule(scenario.SensorSchedule, fullfile(outputFolder, scheduleCsv));
    files(end + 1, 1) = scheduleCsv;
end

connectFile = scenarioName + "_load.connect";
nativeScenarioFile = scenarioName + ".sc";
vdfFile = scenarioName + ".vdf";
loadCommands = buildLoadCommands(scenario, scenarioName, objectRecords, ...
    objectInstances, sensorRecords, sensorInstances);
writeLines(fullfile(outputFolder, connectFile), loadCommands);
files(end + 1, 1) = connectFile;

loaderSource = which("loadStkBundle");
if strlength(string(loaderSource)) == 0
    error("exportStkScenario:LoaderSourceNotFound", ...
        "loadStkBundle.m is not available on the MATLAB path.");
end
loaderFile = "loadStkBundle.m";
copyfile(loaderSource, fullfile(outputFolder, loaderFile), "f");
files(end + 1, 1) = loaderFile;

readmeFile = "README_STK.txt";
writeReadme(fullfile(outputFolder, readmeFile), scenario.Config.Name, ...
    nativeScenarioFile, vdfFile, connectFile);
files(end + 1, 1) = readmeFile;

manifestFile = "manifest.json";
files(end + 1, 1) = manifestFile;
manifest = struct();
manifest.Schema = "matlab-orekit-stk-bundle";
manifest.SchemaVersion = 1;
manifest.StkFileVersion = options.Version;
manifest.GeneratedUtc = string(datetime("now", "TimeZone", "UTC"), ...
    "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
manifest.Scenario = struct("OriginalName", string(scenario.Config.Name), ...
    "StkName", scenarioName, "EpochUtc", formatStkUtc(scenario.Config.Epoch), ...
    "StopUtc", formatStkUtc(scenario.Config.getStopTime()), ...
    "CentralBody", string(scenario.Config.CentralBody));
manifest.ConnectFile = connectFile;
manifest.NativeStkScenarioFile = nativeScenarioFile;
manifest.VdfFile = vdfFile;
manifest.Objects = objectRecords;
manifest.Sensors = sensorRecords;
manifest.Files = unique(files, "stable");
manifest.Warnings = warnings;
writeText(fullfile(outputFolder, manifestFile), ...
    jsonencode(manifest, "PrettyPrint", true));

result = struct("BundleFolder", outputFolder, ...
    "ManifestFile", fullfile(outputFolder, manifestFile), ...
    "ConnectFile", fullfile(outputFolder, connectFile), ...
    "LoaderFile", fullfile(outputFolder, loaderFile), ...
    "NativeStkScenarioFile", fullfile(outputFolder, nativeScenarioFile), ...
    "VdfFile", fullfile(outputFolder, vdfFile), ...
    "Files", unique(files, "stable"), "Warnings", warnings);
end

function records = emptyObjectRecords()
records = repmat(struct("OriginalName", "", "StkName", "", ...
    "ObjectType", "", "StkClass", "", "EphemerisFile", "", ...
    "AttitudeFile", "", "AzElMaskFile", "", "Notes", ""), 0, 1);
end

function records = emptySensorRecords()
records = repmat(struct("OriginalName", "", "StkName", "", ...
    "ParentOriginalName", "", "ParentStkName", "", ...
    "ParentStkClass", "", "PointingFile", "", "PatternFile", "", ...
    "DefinitionType", "", "DefinitionParameters", zeros(1, 0)), 0, 1);
end

function [records, instances, files, warnings] = exportSensors( ...
        scenario, objectRecords, objectInstances, outputFolder, ~, version)
records = emptySensorRecords();
instances = {};
files = strings(0, 1);
warnings = strings(0, 1);
usedByParent = containers.Map("KeyType", "char", "ValueType", "any");

for k = 1:numel(objectInstances)
    parent = objectInstances{k};
    if ~isprop(parent, "Sensors") || isempty(parent.Sensors)
        continue;
    end
    parentRecord = objectRecords(k);
    parentKey = char(lower(parentRecord.StkClass + "/" + parentRecord.StkName));
    if isKey(usedByParent, parentKey)
        usedNames = string(usedByParent(parentKey));
    else
        usedNames = strings(0, 1);
    end
    for sensorIndex = 1:numel(parent.Sensors)
        sensor = parent.Sensors{sensorIndex};
        [stkName, usedNames] = uniqueStkName(sensor.Name, usedNames);
        fileStem = parentRecord.StkName + "__" + stkName;
        pointingRelative = "";
        if isa(parent, "SatelliteObject") && isempty(parent.Ephemeris)
            warnings(end + 1, 1) = "Sensor '" + string(sensor.Name) + ...
                "' has an unpropagated satellite parent; no .sp file was written."; %#ok<AGROW>
        else
            pointingRelative = normalizedRelative(fullfile("sensors", fileStem + ".sp"));
            exportStkSensorPointing(scenario, parent.Name, sensor.Name, ...
                fullfile(outputFolder, pointingRelative), "Version", version);
            files(end + 1, 1) = pointingRelative; %#ok<AGROW>
        end

        patternRelative = "";
        if ~isempty(sensor.CustomFovBoundary) && height(sensor.CustomFovBoundary) > 0
            try
                patternRelative = normalizedRelative(fullfile( ...
                    "sensors", fileStem + ".pattern"));
                exportStkSensorPattern(sensor.CustomFovBoundary, ...
                    fullfile(outputFolder, patternRelative), "Version", version);
                files(end + 1, 1) = patternRelative; %#ok<AGROW>
            catch err
                patternRelative = "";
                warnings(end + 1, 1) = "Custom FOV for sensor '" + ...
                    string(sensor.Name) + "' fell back to its cone: " + ...
                    string(err.message); %#ok<AGROW>
            end
        end
        [definitionType, definitionParameters] = sensorDefinition(sensor, patternRelative);
        record = struct("OriginalName", string(sensor.Name), ...
            "StkName", stkName, "ParentOriginalName", string(parent.Name), ...
            "ParentStkName", parentRecord.StkName, ...
            "ParentStkClass", parentRecord.StkClass, ...
            "PointingFile", pointingRelative, "PatternFile", patternRelative, ...
            "DefinitionType", definitionType, ...
            "DefinitionParameters", definitionParameters);
        records(end + 1, 1) = record; %#ok<AGROW>
        instances{end + 1, 1} = sensor; %#ok<AGROW>
    end
    usedByParent(parentKey) = usedNames;
end
end

function [definitionType, parameters] = sensorDefinition(sensor, patternFile)
if strlength(patternFile) > 0
    definitionType = "Custom";
    parameters = zeros(1, 0);
    return;
end
type = upper(string(sensor.FieldOfViewType));
if contains(type, "RECTANGULAR")
    definitionType = "Rectangular";
    parameters = [sensor.RectangularHalfAngleYDeg, sensor.RectangularHalfAngleXDeg];
elseif contains(type, "COMPLEX") || contains(type, "ANNULAR")
    definitionType = "Conical";
    parameters = [sensor.InnerHalfAngleDeg, sensor.OuterHalfAngleDeg, 0, 360];
else
    definitionType = "SimpleCone";
    parameters = sensor.effectiveConeHalfAngleDeg();
end
end

function commands = buildLoadCommands(scenario, scenarioName, objectRecords, ...
        objectInstances, sensorRecords, sensorInstances)
commands = [
    "# Generated by MATLAB Orekit Mission Suite"
    "# Close any open STK scenario before executing this file."
    "Units_SetConnect / Default"
    "New / Scenario " + scenarioName
    "SetAnalysisTimePeriod * """ + formatStkUtc(scenario.Config.Epoch) + ...
        """ """ + formatStkUtc(scenario.Config.getStopTime()) + """"
    "SetEpoch * """ + formatStkUtc(scenario.Config.Epoch) + """"
    ];

for k = 1:numel(objectRecords)
    record = objectRecords(k);
    object = objectInstances{k};
    path = "*/" + record.StkClass + "/" + record.StkName;
    commands(end + 1, 1) = ""; %#ok<AGROW>
    commands(end + 1, 1) = "New / */" + record.StkClass + " " + record.StkName; %#ok<AGROW>
    if isa(object, "SatelliteObject")
        if strlength(record.EphemerisFile) > 0
            commands(end + 1, 1) = "SetState " + path + " FromFile """ + ...
                bundlePath(record.EphemerisFile) + """ FileFormat StkPL"; %#ok<AGROW>
        end
        if strlength(record.AttitudeFile) > 0
            commands(end + 1, 1) = "SetAttitude " + path + " File """ + ...
                bundlePath(record.AttitudeFile) + """"; %#ok<AGROW>
        end
    elseif isa(object, "AreaTargetObject")
        boundaryValues = reshape([object.BoundaryLatDeg(:), ...
            object.BoundaryLonDeg(:)].', 1, []);
        commands(end + 1, 1) = "SetBoundary " + path + ...
            " Pattern LatLon " + num2str(numel(object.BoundaryLatDeg)) + ...
            " " + strjoin(compose("%.12g", boundaryValues), " "); %#ok<AGROW>
    elseif isprop(object, "LatitudeDeg") && isprop(object, "LongitudeDeg")
        altitude = 0;
        if isprop(object, "AltitudeMeters")
            altitude = object.AltitudeMeters;
        end
        commands(end + 1, 1) = string(sprintf( ...
            "SetPosition %s Geodetic %.12g %.12g %.12g", path, ...
            object.LatitudeDeg, object.LongitudeDeg, altitude)); %#ok<AGROW>
    end
    if strlength(record.AzElMaskFile) > 0
        commands(end + 1, 1) = "SetAzElMask " + path + " MaskFile """ + ...
            bundlePath(record.AzElMaskFile) + """"; %#ok<AGROW>
    end
end

for k = 1:numel(sensorRecords)
    record = sensorRecords(k);
    sensor = sensorInstances{k};
    path = "*/" + record.ParentStkClass + "/" + record.ParentStkName + ...
        "/Sensor/" + record.StkName;
    commands(end + 1, 1) = ""; %#ok<AGROW>
    commands(end + 1, 1) = "New / */" + record.ParentStkClass + "/" + ...
        record.ParentStkName + "/Sensor " + record.StkName; %#ok<AGROW>
    if record.DefinitionType == "Custom"
        commands(end + 1, 1) = "Define " + path + " Custom """ + ...
            bundlePath(record.PatternFile) + """"; %#ok<AGROW>
    else
        parameterText = strjoin(compose("%.12g", record.DefinitionParameters), " ");
        commands(end + 1, 1) = "Define " + path + " " + ...
            record.DefinitionType + " " + parameterText; %#ok<AGROW>
    end
    offset = reshape(double(sensor.MountOffsetMeters), 1, 3);
    if any(abs(offset) > 0)
        commands(end + 1, 1) = string(sprintf( ...
            "Location %s Fixed Cartesian %.12g %.12g %.12g", ...
            path, offset(1), offset(2), offset(3))); %#ok<AGROW>
    else
        commands(end + 1, 1) = "Location " + path + " Center"; %#ok<AGROW>
    end
    if strlength(record.PointingFile) > 0
        commands(end + 1, 1) = "Point " + path + " External """ + ...
            bundlePath(record.PointingFile) + """"; %#ok<AGROW>
    end
end
commands(end + 1, 1) = "";
% SaveAs appends the .sc extension itself based on the saved object type.
commands(end + 1, 1) = "SaveAs / * """ + bundlePath(scenarioName) + """";
end

function writeReadme(filename, scenarioName, nativeScenarioFile, vdfFile, connectFile)
lines = [
    "STK interchange bundle for: " + string(scenarioName)
    ""
    "What is here"
    "------------"
    "*.e        STK external satellite ephemeris (ICRF, meters, seconds)"
    "*.a        Synthesized spacecraft body attitude"
    "*.sp       Absolute Earth-fixed sensor pointing, including task boundaries"
    "*.pattern  Custom sensor field-of-view boundary when present"
    "*.aem      Ground azimuth/elevation mask when present"
    "manifest.json maps original names to STK-safe object and file names."
    ""
    "Create the STK scenario and Viewer file"
    "---------------------------------------"
    "1. Use Windows with STK Desktop 11, 12, or 13 installed."
    "2. In MATLAB, change directory to this bundle and run:"
    "       loadStkBundle(pwd)"
    "3. The loader creates " + string(nativeScenarioFile) + " and " + string(vdfFile) + "."
    "4. Open the .vdf in the free STK Viewer."
    ""
    "To create only the editable STK scenario:"
    "       loadStkBundle(pwd, ""CreateVdf"", false)"
    ""
    "Manual STK import"
    "-----------------"
    "The generated " + string(connectFile) + " is a documented Connect command file."
    "Replace __BUNDLE_DIR__ with this folder's absolute path, close any open"
    "scenario in STK, then run: ConFile / ""<absolute connect file>"""
    ""
    "Important"
    "---------"
    "Raw interchange files cannot be opened directly by the free STK Viewer."
    "STK must author the .vdf; loadStkBundle automates that step when STK is installed."
    "The .a files are derived from the suite's body-frame convention because the"
    "suite does not yet store a commanded or measured spacecraft attitude history."
    ];
writeLines(filename, lines);
end

function stkClass = stkClassFor(object)
if isa(object, "SatelliteObject")
    stkClass = "Satellite";
elseif isa(object, "AreaTargetObject")
    stkClass = "AreaTarget";
elseif isa(object, "FacilityObject") || isa(object, "GroundStationObject")
    stkClass = "Facility";
elseif isa(object, "TargetObject")
    stkClass = "Target";
elseif isa(object, "PlaceObject")
    stkClass = "Place";
else
    stkClass = "";
end
end

function [name, usedNames] = uniqueStkName(originalName, usedNames)
name = regexprep(strtrim(string(originalName)), "[^A-Za-z0-9_-]", "_");
name = regexprep(name, "_+", "_");
if strlength(name) == 0
    name = "Object";
end
first = extractBetween(name, 1, 1);
if isempty(regexp(char(first), "[A-Za-z]", "once"))
    name = "Obj_" + name;
end
if any(strcmpi(name, ["_Default", "end", "con", "prn", "aux", "nul"]))
    name = "Obj_" + name;
end
name = extractBefore(name + " ", min(strlength(name), 64) + 1);
base = name;
suffix = 2;
while any(strcmpi(name, usedNames))
    suffixText = "_" + string(suffix);
    keepLength = max(1, 64 - strlength(suffixText));
    name = extractBefore(base + " ", min(strlength(base), keepLength) + 1) + suffixText;
    suffix = suffix + 1;
end
usedNames(end + 1, 1) = name;
end

function path = bundlePath(relativePath)
path = "__BUNDLE_DIR__\" + replace(string(relativePath), "/", "\");
end

function relative = normalizedRelative(relative)
relative = replace(string(relative), "\", "/");
end

function writeLines(filename, lines)
fid = fopen(filename, "w");
if fid < 0
    error("exportStkScenario:CannotOpenFile", ...
        "Could not open %s for writing.", string(filename));
end
cleaner = onCleanup(@() fclose(fid)); %#ok<NASGU>
for k = 1:numel(lines)
    fprintf(fid, "%s\n", lines(k));
end
end

function writeText(filename, contents)
fid = fopen(filename, "w");
if fid < 0
    error("exportStkScenario:CannotOpenFile", ...
        "Could not open %s for writing.", string(filename));
end
cleaner = onCleanup(@() fclose(fid)); %#ok<NASGU>
fprintf(fid, "%s", contents);
end
