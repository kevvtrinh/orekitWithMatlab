classdef ScenarioClock
    %SCENARIOCLOCK Convenience clock for scenario stepping.

    properties
        StartTime
        StopTime
        Step = seconds(60)
        CurrentTime
    end

    methods
        function obj = ScenarioClock(config)
            if nargin > 0
                obj.StartTime = config.Epoch;
                obj.StopTime = config.getStopTime();
                obj.Step = config.TimeStep;
                obj.CurrentTime = obj.StartTime;
            end
        end

        function obj = setTime(obj, time)
            obj.CurrentTime = min(max(time, obj.StartTime), obj.StopTime);
        end

        function obj = stepForward(obj)
            obj = obj.setTime(obj.CurrentTime + obj.Step);
        end

        function obj = stepBackward(obj)
            obj = obj.setTime(obj.CurrentTime - obj.Step);
        end

        function obj = reset(obj)
            obj.CurrentTime = obj.StartTime;
        end
    end
end

