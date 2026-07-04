classdef PlaceObject < MissionObject
    %PLACEOBJECT Fixed point on Earth used as a place or sensor target.

    properties
        LatitudeDeg double = 0
        LongitudeDeg double = 0
        AltitudeMeters double = 0
        Metadata struct = struct()
        Sensors cell = {}
    end

    methods
        function obj = PlaceObject(name, latitudeDeg, longitudeDeg, altitudeMeters)
            obj.ObjectType = "Place";
            obj.Color = [0.08 0.42 0.20];
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

        function validate(obj)
            validate@MissionObject(obj);
            if obj.LatitudeDeg < -90 || obj.LatitudeDeg > 90
                error("PlaceObject:InvalidLatitude", ...
                    "Place latitude must be between -90 and 90 degrees.");
            end
            if obj.LongitudeDeg < -180 || obj.LongitudeDeg > 180
                error("PlaceObject:InvalidLongitude", ...
                    "Place longitude must be between -180 and 180 degrees.");
            end
        end

        function position = getPosition(obj, ~, frameName)
            if nargin < 3
                frameName = "ECEF";
            end
            if upper(string(frameName)) ~= "ECEF"
                error("PlaceObject:UnsupportedFrame", ...
                    "PlaceObject currently supports ECEF positions.");
            end
            position = obj.getECEF();
        end

        function position = getECEF(obj, ~)
            [x, y, z] = OrekitFrames.geodeticToECEF( ...
                obj.LatitudeDeg, obj.LongitudeDeg, obj.AltitudeMeters);
            position = [x, y, z];
        end

        function lla = getLLA(obj, ~)
            lla = [obj.LatitudeDeg, obj.LongitudeDeg, obj.AltitudeMeters];
        end

        function ax = plotLocation(obj, ax)
            if nargin < 2 || isempty(ax)
                figure("Name", char(obj.Name));
                ax = axes();
            end
            scatter(ax, obj.LongitudeDeg, obj.LatitudeDeg, 55, "filled", ...
                "MarkerFaceColor", obj.Color);
            xlabel(ax, "Longitude (deg)");
            ylabel(ax, "Latitude (deg)");
            grid(ax, "on");
            title(ax, obj.Name);
        end

        function obj = addSensor(obj, sensor)
            sensor = sensor.attachTo(obj);
            if obj.hasSensor(sensor.Name)
                error("PlaceObject:DuplicateSensor", ...
                    "Place '%s' already has a sensor named '%s'.", obj.Name, sensor.Name);
            end
            obj.Sensors{end + 1} = sensor;
        end

        function obj = removeSensor(obj, sensorName)
            obj.Sensors(obj.findSensorIndex(sensorName)) = [];
        end

        function sensor = getSensor(obj, sensorName)
            sensor = obj.Sensors{obj.findSensorIndex(sensorName)};
        end

        function tf = hasSensor(obj, sensorName)
            tf = false;
            for k = 1:numel(obj.Sensors)
                if strcmp(string(obj.Sensors{k}.Name), string(sensorName))
                    tf = true;
                    return;
                end
            end
        end

        function sensors = listSensors(obj)
            sensors = sensorListTable(obj.Sensors);
        end
    end

    methods (Access = private)
        function idx = findSensorIndex(obj, sensorName)
            for k = 1:numel(obj.Sensors)
                if strcmp(string(obj.Sensors{k}.Name), string(sensorName))
                    idx = k;
                    return;
                end
            end
            error("PlaceObject:SensorNotFound", ...
                "Sensor '%s' was not found on place '%s'.", string(sensorName), obj.Name);
        end
    end

    methods (Static)
        function obj = fromStruct(data)
            obj = PlaceObject(data.Name, data.LatitudeDeg, ...
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
