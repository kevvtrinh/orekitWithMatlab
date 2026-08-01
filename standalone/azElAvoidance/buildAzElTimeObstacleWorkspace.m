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

%% Section 1: Forward To The Preferred Builder
% deprecated: Remove this public forwarding shim after one release.
% Keeping this as a transparent forwarding boundary preserves old scripts
% without maintaining a second packing implementation.
obstacleField = buildAzElTimeObstacleField(varargin{:});
end
