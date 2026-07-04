function status = startupOrekitSuite(varargin)
%STARTUPOREKITSUITE Add suite folders to the MATLAB path and initialize Orekit.
%
% status = startupOrekitSuite()
% status = startupOrekitSuite("JarRoot", jarRoot, "DataRoot", dataRoot)

repoRoot = fileparts(mfilename("fullpath"));
addpath(genpath(fullfile(repoRoot, "src")));
matlabRoot = fullfile(repoRoot, "matlab");
if isfolder(matlabRoot)
    addpath(matlabRoot);
end
examplesRoot = fullfile(repoRoot, "examples");
if isfolder(examplesRoot)
    addpath(genpath(examplesRoot));
end

parser = inputParser;
parser.addParameter("JarRoot", fullfile(repoRoot, "vendor", "orekit", "lib"));
parser.addParameter("DataRoot", fullfile(repoRoot, "vendor", "orekit", "data", "orekit-data"));
parser.addParameter("InitializeOrekit", true);
parser.parse(varargin{:});

status = struct("PathsAdded", true, "Orekit", []);
if parser.Results.InitializeOrekit
    status.Orekit = OrekitInitializer.initialize( ...
        parser.Results.JarRoot, parser.Results.DataRoot);
end
end
