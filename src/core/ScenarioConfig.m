classdef ScenarioConfig
    %SCENARIOCONFIG UI-independent scenario settings.

    properties
        Name string = "Untitled Scenario"
        Epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC")
        StopTime = []
        Duration = hours(24)
        TimeStep = seconds(60)
        CentralBody string = "Earth"
        EarthModel string = "WGS84"
        TimeScale string = "UTC"
        OutputFrame string = "GCRF"
        AnimationStep = seconds(60)
        DefaultPropagatorType string = "Keplerian"
    end

    methods
        function obj = ScenarioConfig(varargin)
            if mod(nargin, 2) ~= 0
                error("ScenarioConfig:InvalidInputs", ...
                    "Use name-value pairs when constructing ScenarioConfig.");
            end
            for k = 1:2:nargin
                name = varargin{k};
                if ~isprop(obj, name)
                    error("ScenarioConfig:UnknownProperty", ...
                        "Unknown ScenarioConfig property: %s", string(name));
                end
                obj.(name) = varargin{k + 1};
            end
        end

        function validate(obj)
            if strlength(strtrim(obj.Name)) == 0
                error("ScenarioConfig:InvalidName", "Scenario Name cannot be empty.");
            end
            if ~isdatetime(obj.Epoch) || isempty(obj.Epoch) || any(isnat(obj.Epoch), "all")
                error("ScenarioConfig:InvalidEpoch", "Epoch must be a valid datetime.");
            end
            if seconds(obj.TimeStep) <= 0
                error("ScenarioConfig:InvalidTimeStep", "TimeStep must be positive.");
            end
            if seconds(obj.AnimationStep) <= 0
                error("ScenarioConfig:InvalidAnimationStep", "AnimationStep must be positive.");
            end

            stopTime = obj.getStopTime();
            if stopTime <= obj.Epoch
                error("ScenarioConfig:InvalidStopTime", ...
                    "StopTime must be later than Epoch.");
            end
        end

        function stopTime = getStopTime(obj)
            if ~isempty(obj.StopTime) && ~(isdatetime(obj.StopTime) && any(isnat(obj.StopTime), "all"))
                stopTime = obj.StopTime;
            else
                stopTime = obj.Epoch + obj.Duration;
            end
        end

        function timeVector = getTimeVector(obj)
            obj.validate();
            stopTime = obj.getStopTime();
            timeVector = (obj.Epoch:obj.TimeStep:stopTime).';
            if timeVector(end) < stopTime
                timeVector(end + 1, 1) = stopTime;
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
            obj = ScenarioConfig();
            names = fieldnames(data);
            for k = 1:numel(names)
                if isprop(obj, names{k})
                    obj.(names{k}) = data.(names{k});
                end
            end
            obj.validate();
        end
    end
end

