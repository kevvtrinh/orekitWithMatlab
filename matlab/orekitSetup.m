function status = orekitSetup(jarRoot, dataRoot)
%OREKITSETUP Add Orekit JARs and configure orekit-data for MATLAB.
%
% status = orekitSetup(jarRoot, dataRoot)
%
% jarRoot  Folder containing orekit-*.jar and hipparchus-*.jar files.
% dataRoot Folder containing unzipped Orekit data files.

if nargin < 1 || isempty(jarRoot)
    repoRoot = fileparts(fileparts(mfilename("fullpath")));
    jarRoot = fullfile(repoRoot, "vendor", "orekit", "lib");
end

if nargin < 2
    dataRoot = "";
end

jarRoot = char(jarRoot);
dataRoot = char(dataRoot);

status = struct("JarsAdded", 0, "JarRoot", jarRoot, "DataRoot", dataRoot, ...
    "DataProviders", 0, "JavaVersion", version("-java"), "OrekitLoaded", false);

if ~isfolder(jarRoot)
    error("orekitSetup:MissingJarFolder", ...
        "JAR folder does not exist: %s. Run scripts\\fetch-orekit-runtime.ps1 first or choose your Orekit JAR folder.", jarRoot);
end

jars = dir(fullfile(jarRoot, "**", "*.jar"));
if isempty(jars)
    error("orekitSetup:NoJars", "No JAR files found under %s.", jarRoot);
end

currentClassPath = string(javaclasspath("-all"));
for k = 1:numel(jars)
    jarPath = string(fullfile(jars(k).folder, jars(k).name));
    if ~any(strcmpi(currentClassPath, jarPath))
        javaaddpath(char(jarPath), "-end");
        currentClassPath(end + 1) = jarPath; %#ok<AGROW>
        status.JarsAdded = status.JarsAdded + 1;
    end
end

try
    javaObject("org.orekit.time.DateComponents", int32(2000), int32(1), int32(1));
catch err
    error("orekitSetup:OrekitNotLoaded", ...
        "Orekit classes could not be loaded. Check that Orekit and Hipparchus JARs are all present. Original error: %s", ...
        err.message);
end
status.OrekitLoaded = true;

if ~isempty(strtrim(dataRoot))
    if ~isfolder(dataRoot)
        error("orekitSetup:MissingDataFolder", ...
            "Orekit data folder does not exist: %s.", dataRoot);
    end

    javaMethod("setProperty", "java.lang.System", "orekit.data.path", dataRoot);

    context = javaMethod("getDefault", "org.orekit.data.DataContext");
    manager = context.getDataProvidersManager();
    manager.clearProviders();
    manager.clearLoadedDataNames();

    dataFile = javaObject("java.io.File", dataRoot);
    crawler = javaObject("org.orekit.data.DirectoryCrawler", dataFile);
    manager.addProvider(crawler);
    status.DataProviders = manager.getProviders().size();
end
end
