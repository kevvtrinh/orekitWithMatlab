classdef ImpulsiveManeuver
    %IMPULSIVEMANEUVER Instantaneous delta-V applied during propagation.
    %
    % Frame options:
    %   "TNW"      delta-V given as [alongTrack normal crossTrack] m/s,
    %              where T is the velocity direction, W the orbit normal,
    %              and N = W x T (in-plane, roughly radial).
    %   "Inertial" delta-V given in the scenario inertial frame (GCRF) m/s.

    properties
        Name string = "Maneuver"
        Time = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC")
        Frame string = "TNW"
        DeltaVmps double = [0 0 0]
    end

    methods
        function obj = ImpulsiveManeuver(name, time, frame, deltaVmps)
            if nargin >= 1
                obj.Name = string(name);
            end
            if nargin >= 2
                obj.Time = time;
            end
            if nargin >= 3
                obj.Frame = string(frame);
            end
            if nargin >= 4
                obj.DeltaVmps = reshape(deltaVmps, 1, 3);
            end
        end

        function validate(obj)
            if ~isdatetime(obj.Time) || isnat(obj.Time)
                error("ImpulsiveManeuver:InvalidTime", ...
                    "Maneuver '%s' requires a valid datetime.", obj.Name);
            end
            if ~ismember(upper(obj.Frame), ["TNW", "INERTIAL"])
                error("ImpulsiveManeuver:InvalidFrame", ...
                    "Maneuver '%s' frame must be TNW or Inertial.", obj.Name);
            end
            if numel(obj.DeltaVmps) ~= 3 || any(~isfinite(obj.DeltaVmps))
                error("ImpulsiveManeuver:InvalidDeltaV", ...
                    "Maneuver '%s' requires a finite 1x3 delta-V vector.", obj.Name);
            end
        end

        function magnitude = magnitude(obj)
            magnitude = norm(obj.DeltaVmps);
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
            obj = ImpulsiveManeuver();
            names = fieldnames(data);
            for k = 1:numel(names)
                if isprop(obj, names{k})
                    obj.(names{k}) = data.(names{k});
                end
            end
        end
    end
end
