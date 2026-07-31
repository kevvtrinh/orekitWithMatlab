function obstacleField = buildAzElTimeObstacleWorkspace(varargin)
%% Section 0: Header & Readme
% SYNTAX
%   options = buildAzElTimeObstacleWorkspace()
%   obstacleField = buildAzElTimeObstacleWorkspace(azElData)
%   obstacleField = buildAzElTimeObstacleWorkspace(azElData, options)
%**************************************************************************
% PURPOSE
%   - Forward the deprecated workspace spelling to the obstacle-field
%     builder during the one-release compatibility window.
%**************************************************************************
% INPUTS
%   - varargin (name-compatible inputs)
%       Inputs accepted by buildAzElTimeObstacleField.
%**************************************************************************
% OUTPUTS
%   - obstacleField (scalar struct)
%       Options or packed obstacle field returned by the preferred builder.
%**************************************************************************
% UNITS
%   - Units are defined by buildAzElTimeObstacleField.

% deprecated: Remove this public forwarding shim after one release.
obstacleField = buildAzElTimeObstacleField(varargin{:});
end
