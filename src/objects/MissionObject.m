classdef (Abstract) MissionObject
    %MISSIONOBJECT Abstract base for scenario objects.

    properties
        Name string = ""
        ObjectType string = "MissionObject"
        Description string = ""
        Color double = [0.0 0.45 0.74]
        IsPropagated logical = false
        Ephemeris table = table()
    end

    methods
        function validate(obj)
            if strlength(strtrim(obj.Name)) == 0
                error("MissionObject:InvalidName", "Object Name cannot be empty.");
            end
        end

        function position = getPosition(obj, time)
            if isempty(obj.Ephemeris)
                error("MissionObject:NoEphemeris", ...
                    "Object '%s' does not have ephemeris.", obj.Name);
            end
            [~, idx] = min(abs(obj.Ephemeris.Time - time));
            position = [obj.Ephemeris.X_m(idx), obj.Ephemeris.Y_m(idx), obj.Ephemeris.Z_m(idx)];
        end

        function state = getState(obj, time)
            if isempty(obj.Ephemeris)
                error("MissionObject:NoEphemeris", ...
                    "Object '%s' does not have ephemeris.", obj.Name);
            end
            [~, idx] = min(abs(obj.Ephemeris.Time - time));
            state = [obj.Ephemeris.X_m(idx), obj.Ephemeris.Y_m(idx), obj.Ephemeris.Z_m(idx), ...
                obj.Ephemeris.VX_mps(idx), obj.Ephemeris.VY_mps(idx), obj.Ephemeris.VZ_mps(idx)];
        end

        function data = toStruct(obj)
            data = struct();
            props = properties(obj);
            for k = 1:numel(props)
                data.(props{k}) = obj.(props{k});
            end
        end
    end
end

