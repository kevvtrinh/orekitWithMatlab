classdef SensorSchedule
    %SENSORSCHEDULE Lightweight container for scheduled sensor tasks.

    properties
        Assignments table = table()
        Conflicts table = table()
        Metadata struct = struct()
    end

    methods
        function obj = SensorSchedule(assignments, conflicts)
            if nargin >= 1
                obj.Assignments = assignments;
            end
            if nargin >= 2
                obj.Conflicts = conflicts;
            end
        end
    end
end
