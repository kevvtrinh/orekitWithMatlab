classdef TargetObject < PlaceObject
    %TARGETOBJECT Fixed or sampled moving target in Earth-fixed coordinates.
    % Moving positions use the nearest trajectory sample, including at the
    % span edges. Cartesian trajectories are ECEF meters; geodetic histories
    % use WGS84 latitude/longitude degrees and altitude meters.

    properties
        TargetType string = "FixedPoint"
        Trajectory table = table()
        Priority double = 1
        RequiredDwellTimeSeconds double = 0
    end

    methods
        function obj = TargetObject(name, latitudeDeg, longitudeDeg, altitudeMeters)
            obj@PlaceObject();
            obj.ObjectType = "Target";
            obj.Color = [0.70 0.10 0.10];
            if nargin >= 1
                obj.Name = string(name);
            end
            if nargin >= 2
                obj.LatitudeDeg = latitudeDeg;
                obj.LongitudeDeg = longitudeDeg;
            end
            if nargin >= 4
                obj.AltitudeMeters = altitudeMeters;
            end
        end

        function position = getPosition(obj, time, frameName)
            %GETPOSITION ECEF meters at the nearest trajectory sample.
            if nargin < 3
                frameName = "ECEF";
            end
            if ~strcmpi(frameName, "ECEF")
                error("TargetObject:UnsupportedFrame", ...
                    "TargetObject positions are available only in ECEF.");
            end
            position = obj.getECEF(time);
        end

        function position = getECEF(obj, time)
            %GETECEF ECEF meters; moving targets require a scalar datetime.
            if nargin < 2
                time = [];
            end
            if obj.isMoving()
                if ~isdatetime(time) || ~isscalar(time) || isnat(time)
                    error("TargetObject:InvalidTime", ...
                        "A moving target requires a valid scalar datetime.");
                end
                [~, idx] = min(abs(obj.Trajectory.Time - time));
                if all(ismember(["X_m", "Y_m", "Z_m"], obj.Trajectory.Properties.VariableNames))
                    position = [obj.Trajectory.X_m(idx), obj.Trajectory.Y_m(idx), obj.Trajectory.Z_m(idx)];
                    return;
                end
                if all(ismember(["LatitudeDeg", "LongitudeDeg", "AltitudeMeters"], obj.Trajectory.Properties.VariableNames))
                    [x, y, z] = OrekitFrames.geodeticToECEF( ...
                        obj.Trajectory.LatitudeDeg(idx), ...
                        obj.Trajectory.LongitudeDeg(idx), ...
                        obj.Trajectory.AltitudeMeters(idx));
                    position = [x, y, z];
                    return;
                end
                error("TargetObject:InvalidTrajectory", ...
                    "Trajectory requires ECEF X_m/Y_m/Z_m or geodetic columns.");
            end
            position = getECEF@PlaceObject(obj, time);
        end

        function lla = getLLA(obj, time)
            %GETLLA WGS84 [latitudeDeg longitudeDeg altitudeMeters].
            if obj.isMoving() && all(ismember(["LatitudeDeg", "LongitudeDeg", "AltitudeMeters"], obj.Trajectory.Properties.VariableNames))
                [~, idx] = min(abs(obj.Trajectory.Time - time));
                lla = [obj.Trajectory.LatitudeDeg(idx), ...
                    obj.Trajectory.LongitudeDeg(idx), ...
                    obj.Trajectory.AltitudeMeters(idx)];
            elseif obj.isMoving()
                lla = OrekitFrames.ecefToGeodetic(obj.getECEF(time), time);
            else
                lla = getLLA@PlaceObject(obj, time);
            end
        end

        function tf = isMoving(obj)
            tf = ~isempty(obj.Trajectory) && height(obj.Trajectory) > 0;
        end

        function validate(obj)
            validate@PlaceObject(obj);
            supported = ["FixedPoint", "MovingPoint", "GroundVehicle", ...
                "Aircraft", "Ship", "SpaceObject", "GenericPointTarget", "Point"];
            if ~any(strcmpi(obj.TargetType, supported))
                error("TargetObject:UnsupportedType", ...
                    "Unsupported target type: %s.", obj.TargetType);
            end
        end
    end

    methods (Static)
        function obj = fromStruct(data)
            obj = TargetObject(data.Name, data.LatitudeDeg, ...
                data.LongitudeDeg, data.AltitudeMeters);
            names = fieldnames(data);
            for k = 1:numel(names)
                if isprop(obj, names{k})
                    obj.(names{k}) = restoreSensorCellIfNeeded(data.(names{k}), names{k});
                end
            end
        end
    end
end
