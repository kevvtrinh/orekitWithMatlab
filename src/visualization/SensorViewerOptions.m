classdef SensorViewerOptions
    %SENSORVIEWEROPTIONS Display options for satellite sensor inspection.

    properties
        ParentAxes = []
        ShowSatelliteBody logical = true
        ShowBodyFrame logical = true
        ShowSensorMounts logical = true
        ShowBoresight logical = true
        ShowFOV logical = true
        ShowFOR logical = false
        ShowLabels logical = true
        ShowActiveTaskPointing logical = false
        ShowScheduledTargetLines logical = false
        SelectedSensorName string = ""
        FOVScale double = 1.5
        FORScale double = 2.5
        BoresightLength double = 1.2
        SatelliteScale double = 1.0
        UseTransparency logical = true
        ViewMode string = "BodyFrame"
    end

    methods
        function obj = SensorViewerOptions(varargin)
            if mod(nargin, 2) ~= 0
                error("SensorViewerOptions:InvalidInputs", ...
                    "Use name-value pairs when constructing SensorViewerOptions.");
            end
            for k = 1:2:nargin
                name = string(varargin{k});
                if ~isprop(obj, name)
                    error("SensorViewerOptions:UnknownProperty", ...
                        "Unknown SensorViewerOptions property: %s.", name);
                end
                obj.(name) = varargin{k + 1};
            end
            obj.validate();
        end

        function validate(obj)
            supported = ["BodyFrame", "ScenarioFrame", "NadirPointing", ...
                "CurrentAttitude", "TaskPointing"];
            if ~any(strcmpi(obj.ViewMode, supported))
                error("SensorViewerOptions:UnsupportedViewMode", ...
                    "Unsupported ViewMode: %s.", obj.ViewMode);
            end
            if obj.FOVScale <= 0 || obj.FORScale <= 0 || obj.BoresightLength <= 0
                error("SensorViewerOptions:InvalidScale", ...
                    "Viewer scales must be positive.");
            end
        end
    end
end
