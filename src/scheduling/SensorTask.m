classdef SensorTask
    %SENSORTASK UI-independent sensor task request.

    properties
        TaskID string = ""
        TaskName string = ""
        TaskType string = "TrackPointTarget"
        TargetName string = ""
        AssignedSensorName string = ""
        AssignedPlatformName string = ""
        Priority double = 1
        EarliestStartTime = NaT(1, 1, "TimeZone", "UTC")
        LatestStopTime = NaT(1, 1, "TimeZone", "UTC")
        RequiredStartTime = NaT(1, 1, "TimeZone", "UTC")
        RequiredStopTime = NaT(1, 1, "TimeZone", "UTC")
        MinDurationSeconds double = 0
        MaxDurationSeconds double = Inf
        RequiredDwellTimeSeconds double = 0
        RequiredCoveragePercent double = 0
        RequiredRevisitTimeSeconds double = Inf
        RequiresSimultaneousSensors logical = false
        RequiredSensorCount double = 1
        AllowedSensorNames string = strings(0, 1)
        AllowedPlatformNames string = strings(0, 1)
        ForbiddenSensorNames string = strings(0, 1)
        TaskStatus string = "Unscheduled"
        Metadata struct = struct()
    end

    methods
        function obj = SensorTask(varargin)
            if nargin == 0
                obj.TaskID = SensorTask.newID();
                obj.TaskName = obj.TaskID;
                return;
            end
            if mod(nargin, 2) ~= 0
                error("SensorTask:InvalidInputs", ...
                    "Use name-value pairs when constructing SensorTask.");
            end
            obj.TaskID = SensorTask.newID();
            for k = 1:2:nargin
                name = string(varargin{k});
                if ~isprop(obj, name)
                    error("SensorTask:UnknownProperty", ...
                        "Unknown SensorTask property: %s.", name);
                end
                obj.(name) = varargin{k + 1};
            end
            if strlength(strtrim(obj.TaskName)) == 0
                obj.TaskName = obj.TaskID;
            end
            obj.validate();
        end

        function validate(obj)
            supportedTypes = ["TrackPointTarget", "TrackMovingTarget", ...
                "ScanAreaTarget", "RevisitAreaTarget", ...
                "StereoObservePointTarget", "MultiSensorTrackPointTarget", ...
                "MultiSensorScanAreaTarget", "DwellOnTarget", "SearchArea", ...
                "ImageStrip", "CollectOverPass"];
            if ~any(strcmpi(obj.TaskType, supportedTypes))
                error("SensorTask:UnsupportedTaskType", ...
                    "Unsupported task type: %s.", obj.TaskType);
            end
            supportedStatus = ["Unscheduled", "CandidateGenerated", ...
                "Scheduled", "PartiallyScheduled", "Rejected", ...
                "Completed", "Failed"];
            if ~any(strcmpi(obj.TaskStatus, supportedStatus))
                error("SensorTask:UnsupportedStatus", ...
                    "Unsupported task status: %s.", obj.TaskStatus);
            end
            if strlength(strtrim(obj.TargetName)) == 0
                error("SensorTask:MissingTarget", "TargetName is required.");
            end
            if obj.Priority < 0
                error("SensorTask:InvalidPriority", "Priority must be nonnegative.");
            end
            if obj.RequiredSensorCount < 1
                error("SensorTask:InvalidSensorCount", ...
                    "RequiredSensorCount must be at least 1.");
            end
        end

        function data = toStruct(obj)
            data = struct();
            props = properties(obj);
            for k = 1:numel(props)
                data.(props{k}) = obj.(props{k});
            end
        end
    end

    methods (Static)
        function obj = fromStruct(data)
            obj = SensorTask();
            names = fieldnames(data);
            for k = 1:numel(names)
                if isprop(obj, names{k})
                    obj.(names{k}) = data.(names{k});
                end
            end
            obj.validate();
        end

        function id = newID()
            id = "TASK-" + string(char(java.util.UUID.randomUUID()));
            id = extractBefore(id, 14);
        end
    end
end
