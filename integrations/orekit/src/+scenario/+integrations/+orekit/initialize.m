function status = initialize()
%% Section 0: Header & Readme
% SYNTAX
%   status = scenario.integrations.orekit.initialize()
%**************************************************************************
% PURPOSE
%   - Load the repository-pinned Orekit runtime and configure its data.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - status (scalar struct)
%       Runtime version, configured paths, provider count, and load status.
%**************************************************************************
% UNITS
%   - Not applicable.
%**************************************************************************

%% Section 1: Resolve And Validate Runtime Paths

persistent initializedStatus
if ~isempty(initializedStatus)
    status = initializedStatus;
    return
end

integrationRoot = fileparts(fileparts(fileparts(fileparts( ...
    fileparts(mfilename("fullpath"))))));
repositoryRoot = fileparts(fileparts(integrationRoot));
libraryRoot = fullfile(integrationRoot, "lib");
dataRoot = fullfile(repositoryRoot, "data", "orekit", "orekit-data");
dataRevisionPath = fullfile(repositoryRoot, "data", "orekit", ...
    "orekit-data-revision.txt");

if ~isfolder(libraryRoot)
    error("orekitInitialize:MissingRuntime", ...
        "Orekit JAR folder is unavailable at '%s'. Run " + ...
        "integrations/orekit/tools/installOrekitRuntime.ps1.", libraryRoot);
end
if ~isfolder(dataRoot)
    error("orekitInitialize:MissingData", ...
        "Orekit data is unavailable at '%s'. Run " + ...
        "integrations/orekit/tools/installOrekitRuntime.ps1.", dataRoot);
end

jarFiles = dir(fullfile(libraryRoot, "*.jar"));
if isempty(jarFiles)
    error("orekitInitialize:MissingRuntime", ...
        "No Orekit runtime JAR files were found in '%s'.", libraryRoot);
end

%% Section 2: Add The Java Runtime

currentClassPath = string(javaclasspath("-all"));
addedJarCount = 0;
for jarIndex = 1:numel(jarFiles)
    jarPath = string(fullfile(jarFiles(jarIndex).folder, ...
        jarFiles(jarIndex).name));
    if any(strcmpi(currentClassPath, jarPath))
        continue
    end
    javaaddpath(char(jarPath), "-end");
    currentClassPath(end + 1, 1) = jarPath; %#ok<AGROW>
    addedJarCount = addedJarCount + 1;
end

try
    javaMethod("getGCRF", "org.orekit.frames.FramesFactory");
catch runtimeError
    error("orekitInitialize:RuntimeLoadFailed", ...
        "Orekit Java classes could not be loaded: %s", runtimeError.message);
end

%% Section 3: Configure Orekit Data

dataContext = javaMethod("getDefault", "org.orekit.data.DataContext");
providerManager = dataContext.getDataProvidersManager();
providerManager.clearProviders();
providerManager.clearLoadedDataNames();
dataFolder = javaObject("java.io.File", dataRoot);
providerManager.addProvider(javaObject( ...
    "org.orekit.data.DirectoryCrawler", dataFolder));

%% Section 4: Assemble Runtime Status

dataVersion = "unknown";
if isfile(dataRevisionPath)
    dataVersion = strtrim(string(fileread(dataRevisionPath)));
end
status = struct( ...
    "IsInitialized", true, ...
    "OrekitVersion", "13.1.6", ...
    "LibraryRoot", string(libraryRoot), ...
    "DataRoot", string(dataRoot), ...
    "DataVersion", dataVersion, ...
    "AddedJarCount", addedJarCount, ...
    "DataProviderCount", double(providerManager.getProviders().size()));
initializedStatus = status;
end
