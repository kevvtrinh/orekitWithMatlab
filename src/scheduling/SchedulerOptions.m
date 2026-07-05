classdef SchedulerOptions
    %SCHEDULEROPTIONS Options and weights for sensor task scheduling.

    properties
        SchedulerType string = "Greedy"
        EnforceOneTaskPerSensor logical = true
        EnforceSlew logical = true
        UseFieldOfRegardForTasking logical = true
        AccessTimeStepSeconds double = 10
        AllowPartialAreaCoverage logical = true
        AllowTaskSplitting logical = false
        AllowMultiSensorTasks logical = true
        SimultaneousToleranceSeconds double = 30
        MinimumCandidateDurationSeconds double = 0
        MinimumCoveragePercent double = 0
        PriorityWeight double = 0.35
        QualityWeight double = 0.30
        CoverageWeight double = 0.20
        DwellWeight double = 0.15
        SlewPenaltyWeight double = 0.05
        DataPenaltyWeight double = 0.02
        RevisitWeight double = 0
        UseMILP logical = false
        MILPSolverName string = "None"
        Verbose logical = false
    end

    methods
        function obj = SchedulerOptions(varargin)
            if mod(nargin, 2) ~= 0
                error("SchedulerOptions:InvalidInputs", ...
                    "Use name-value pairs when constructing SchedulerOptions.");
            end
            for k = 1:2:nargin
                name = string(varargin{k});
                if ~isprop(obj, name)
                    error("SchedulerOptions:UnknownProperty", ...
                        "Unknown SchedulerOptions property: %s.", name);
                end
                obj.(name) = varargin{k + 1};
            end
            obj.validate();
        end

        function validate(obj)
            supported = ["Greedy", "MILP", "Manual", "None"];
            if ~any(strcmpi(obj.SchedulerType, supported))
                error("SchedulerOptions:UnsupportedType", ...
                    "Unsupported scheduler type: %s.", obj.SchedulerType);
            end
            if obj.SimultaneousToleranceSeconds < 0 || obj.MinimumCandidateDurationSeconds < 0
                error("SchedulerOptions:InvalidTime", ...
                    "Time tolerances and minimum durations must be nonnegative.");
            end
        end
    end
end
