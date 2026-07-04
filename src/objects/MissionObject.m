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
            state = obj.getState(time);
            position = state(1:3);
        end

        function state = getState(obj, time)
            %GETSTATE Interpolated GCRF state at an arbitrary time.
            %
            % Cubic-Hermite between the bracketing ephemeris samples using
            % the stored velocities; clamps to the span edges outside it.
            if isempty(obj.Ephemeris)
                error("MissionObject:NoEphemeris", ...
                    "Object '%s' does not have ephemeris.", obj.Name);
            end
            ephemeris = obj.Ephemeris;
            n = height(ephemeris);
            if time <= ephemeris.Time(1)
                idx = 1;
            elseif time >= ephemeris.Time(n)
                idx = n;
            else
                idx = 0;
            end
            if idx > 0
                state = [ephemeris.X_m(idx), ephemeris.Y_m(idx), ephemeris.Z_m(idx), ...
                    ephemeris.VX_mps(idx), ephemeris.VY_mps(idx), ephemeris.VZ_mps(idx)];
                return;
            end

            i0 = find(ephemeris.Time <= time, 1, "last");
            i1 = i0 + 1;
            h = seconds(ephemeris.Time(i1) - ephemeris.Time(i0));
            s = seconds(time - ephemeris.Time(i0)) / h;

            p0 = [ephemeris.X_m(i0), ephemeris.Y_m(i0), ephemeris.Z_m(i0)];
            p1 = [ephemeris.X_m(i1), ephemeris.Y_m(i1), ephemeris.Z_m(i1)];
            v0 = [ephemeris.VX_mps(i0), ephemeris.VY_mps(i0), ephemeris.VZ_mps(i0)];
            v1 = [ephemeris.VX_mps(i1), ephemeris.VY_mps(i1), ephemeris.VZ_mps(i1)];

            h00 = 2 * s^3 - 3 * s^2 + 1;
            h10 = s^3 - 2 * s^2 + s;
            h01 = -2 * s^3 + 3 * s^2;
            h11 = s^3 - s^2;
            position = h00 * p0 + (h10 * h) * v0 + h01 * p1 + (h11 * h) * v1;
            velocity = ((6 * s^2 - 6 * s) / h) * p0 + (3 * s^2 - 4 * s + 1) * v0 + ...
                ((-6 * s^2 + 6 * s) / h) * p1 + (3 * s^2 - 2 * s) * v1;
            state = [position, velocity];
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

