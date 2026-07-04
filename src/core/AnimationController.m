classdef AnimationController
    %ANIMATIONCONTROLLER UI-independent animation state controller.

    properties
        CurrentTime
        StartTime
        StopTime
        Step = seconds(60)
        IsPlaying logical = false
        PlaybackRate double = 1
    end

    methods
        function obj = AnimationController(config)
            if nargin > 0
                obj.StartTime = config.Epoch;
                obj.StopTime = config.getStopTime();
                obj.Step = config.AnimationStep;
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

        function obj = play(obj)
            obj.IsPlaying = true;
        end

        function obj = pause(obj)
            obj.IsPlaying = false;
        end
    end
end

