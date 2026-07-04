classdef OrekitInitializer
    %OREKITINITIALIZER Owns Orekit Java classpath and data configuration.

    methods (Static)
        function status = initialize(jarRoot, dataRoot)
            persistent initialized lastJarRoot lastDataRoot

            if nargin == 0 && isequal(initialized, true)
                status = struct("Initialized", true, "JarsAdded", 0, ...
                    "JarRoot", lastJarRoot, "DataRoot", lastDataRoot, ...
                    "DataProviders", OrekitInitializer.providerCount(), ...
                    "JavaVersion", version("-java"));
                return;
            end

            if nargin < 1 || isempty(jarRoot)
                repoRoot = OrekitInitializer.repoRoot();
                jarRoot = fullfile(repoRoot, "vendor", "orekit", "lib");
            end
            if nargin < 2 || isempty(dataRoot)
                repoRoot = OrekitInitializer.repoRoot();
                dataRoot = fullfile(repoRoot, "vendor", "orekit", "data", "orekit-data");
            end

            jarRoot = char(jarRoot);
            dataRoot = char(dataRoot);

            status = struct("Initialized", false, "JarsAdded", 0, ...
                "JarRoot", jarRoot, "DataRoot", dataRoot, ...
                "DataProviders", 0, "JavaVersion", version("-java"));

            if isequal(initialized, true) && strcmp(lastJarRoot, jarRoot) && strcmp(lastDataRoot, dataRoot)
                status.Initialized = true;
                status.DataProviders = OrekitInitializer.providerCount();
                return;
            end

            if ~isfolder(jarRoot)
                error("OrekitInitializer:MissingJarRoot", ...
                    "Orekit JAR folder does not exist: %s", jarRoot);
            end
            jars = dir(fullfile(jarRoot, "**", "*.jar"));
            if isempty(jars)
                error("OrekitInitializer:NoJars", ...
                    "No JAR files were found under %s.", jarRoot);
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
                error("OrekitInitializer:OrekitNotLoaded", ...
                    "Orekit classes could not be loaded. Original error: %s", err.message);
            end

            if ~isfolder(dataRoot)
                error("OrekitInitializer:MissingDataRoot", ...
                    "Orekit data folder does not exist: %s", dataRoot);
            end

            javaMethod("setProperty", "java.lang.System", "orekit.data.path", dataRoot);
            context = javaMethod("getDefault", "org.orekit.data.DataContext");
            manager = context.getDataProvidersManager();
            manager.clearProviders();
            manager.clearLoadedDataNames();
            dataFile = javaObject("java.io.File", dataRoot);
            manager.addProvider(javaObject("org.orekit.data.DirectoryCrawler", dataFile));

            status.DataProviders = manager.getProviders().size();
            status.Initialized = true;
            initialized = true;
            lastJarRoot = jarRoot;
            lastDataRoot = dataRoot;
        end

        function root = repoRoot()
            root = fileparts(fileparts(fileparts(mfilename("fullpath"))));
        end

        function n = providerCount()
            try
                context = javaMethod("getDefault", "org.orekit.data.DataContext");
                n = context.getDataProvidersManager().getProviders().size();
            catch
                n = 0;
            end
        end
    end
end
