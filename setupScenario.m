function configuredPaths = setupScenario(productName)
%% Section 0: Header & Readme
% SYNTAX
%   configuredPaths = setupScenario()
%   configuredPaths = setupScenario(productName)
%**************************************************************************
% PURPOSE
%   - Add the modules required by the basic Scenario product to MATLAB's path.
%**************************************************************************
% INPUTS
%   - productName (string scalar, optional; default "basic")
%       Use "basic" for model classes or "threejs" to include the viewer.
%**************************************************************************
% OUTPUTS
%   - configuredPaths (N-by-1 string array)
%       Absolute module source paths added for the current MATLAB session.
%**************************************************************************
% UNITS
%   - Not applicable.
%**************************************************************************

%% Section 1: Resolve Product Paths

repositoryRoot = fileparts(mfilename("fullpath"));
if nargin == 0 || isempty(productName)
    productName = "basic";
end
productName = string(productName);
if ~(isscalar(productName) && any(productName == ["basic", "threejs"]))
    error("setupScenario:UnknownProduct", ...
        "productName must be 'basic' or 'threejs'.");
end

relativePaths = [ ...
    "modules/platforms/src"; ...
    "modules/targets/src"; ...
    "modules/scenario/src"; ...
    "modules/frames/src"];
if productName == "threejs"
    relativePaths(end + 1, 1) = "modules/environment/src";
    relativePaths(end + 1, 1) = "integrations/orekit/src";
    relativePaths(end + 1, 1) = "integrations/threejs/src";
end
configuredPaths = strings(size(relativePaths));

%% Section 2: Add Required Modules

for pathIndex = 1:numel(relativePaths)
    configuredPaths(pathIndex) = fullfile(repositoryRoot, relativePaths(pathIndex));
    addpath(configuredPaths(pathIndex));
end
end
