function stats = launchOrbitStaticUi(varargin)
%LAUNCHORBITSTATICUI Start the no-Node static Orbit Console.
%
% stats = launchOrbitStaticUi()
% stats = launchOrbitStaticUi("Port", 8321, "OpenBrowser", true)
%
% This launcher serves apps/orbit-static-ui with MATLAB's bundled Java
% runtime. It binds to 127.0.0.1 only and blocks the MATLAB command window
% while the bridge is running. Press Ctrl+C in MATLAB to stop it.

parser = inputParser;
parser.addParameter("Port", 8321, @(v) isnumeric(v) && isscalar(v) && v > 0);
parser.addParameter("OpenBrowser", true, @(v) islogical(v) && isscalar(v));
parser.addParameter("Quiet", false, @(v) islogical(v) && isscalar(v));
parser.addParameter("MaxRequests", Inf, @(v) isnumeric(v) && isscalar(v) && v > 0);
parser.parse(varargin{:});
opts = parser.Results;

repoRoot = fileparts(fileparts(mfilename("fullpath")));
srcRoot = fullfile(repoRoot, "src");
if isfolder(srcRoot)
    addpath(genpath(srcRoot));
end

staticRoot = fullfile(repoRoot, "apps", "orbit-static-ui");
if ~isfolder(staticRoot)
    error("launchOrbitStaticUi:MissingApp", ...
        "Static UI app not found: %s", staticRoot);
end

url = sprintf("http://127.0.0.1:%d/", opts.Port);
fprintf("Orbit Console static UI\n");
fprintf("  URL: %s\n", url);
fprintf("  Root: %s\n", staticRoot);
fprintf("  Press Ctrl+C in MATLAB to stop the bridge.\n\n");

if opts.OpenBrowser
    web(url, "-browser");
end

stats = orbitStaticUiServe( ...
    "Root", staticRoot, ...
    "Port", opts.Port, ...
    "Quiet", opts.Quiet, ...
    "MaxRequests", opts.MaxRequests);
end
