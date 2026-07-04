classdef TaskCandidate
    %TASKCANDIDATE Lightweight container for scheduler-ready candidate data.

    properties
        Data table = table()
    end

    methods
        function obj = TaskCandidate(data)
            if nargin > 0
                obj.Data = data;
            end
        end
    end
end
