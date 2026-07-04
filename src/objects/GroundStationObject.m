classdef GroundStationObject < MissionObject
    %GROUNDSTATIONOBJECT Fixed Earth ground station.

    properties
        LatitudeDeg double = 0
        LongitudeDeg double = 0
        AltitudeMeters double = 0
        MinElevationDeg double = 5
        AzElMask table = table()
        AvailabilityWindows table = table()
        Sensors cell = {}
    end

    methods
        function obj = GroundStationObject(name, latitudeDeg, longitudeDeg, altitudeMeters, minElevationDeg)
            obj.ObjectType = "GroundStation";
            obj.Color = [0.10 0.30 0.88];
            if nargin >= 1
                obj.Name = string(name);
            end
            if nargin >= 2
                obj.LatitudeDeg = latitudeDeg;
                obj.LongitudeDeg = longitudeDeg;
                obj.AltitudeMeters = altitudeMeters;
            end
            if nargin >= 5
                obj.MinElevationDeg = minElevationDeg;
            end
        end

        function validate(obj)
            validate@MissionObject(obj);
            if obj.LatitudeDeg < -90 || obj.LatitudeDeg > 90
                error("GroundStationObject:InvalidLatitude", ...
                    "Ground station latitude must be between -90 and 90 degrees.");
            end
            if obj.LongitudeDeg < -180 || obj.LongitudeDeg > 180
                error("GroundStationObject:InvalidLongitude", ...
                    "Ground station longitude must be between -180 and 180 degrees.");
            end
            if obj.MinElevationDeg < -90 || obj.MinElevationDeg > 90
                error("GroundStationObject:InvalidMinElevation", ...
                    "Minimum elevation must be between -90 and 90 degrees.");
            end
        end

        function frame = buildOrekitTopocentricFrame(obj)
            frame = OrekitFrames.topocentricFrame(obj);
        end

        function position = getPosition(obj, ~)
            [x, y, z] = OrekitFrames.geodeticToECEF( ...
                obj.LatitudeDeg, obj.LongitudeDeg, obj.AltitudeMeters);
            position = [x, y, z];
        end

        function aer = computeAzElRangeTo(obj, targetObject, timeVector)
            aer = computeAzElRange(targetObject, obj, timeVector);
        end

        function obj = addSensor(obj, sensor)
            sensor = sensor.attachTo(obj);
            if obj.hasSensor(sensor.Name)
                error("GroundStationObject:DuplicateSensor", ...
                    "Ground station '%s' already has a sensor named '%s'.", obj.Name, sensor.Name);
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
            error("GroundStationObject:SensorNotFound", ...
                "Sensor '%s' was not found on ground station '%s'.", string(sensorName), obj.Name);
        end
    end

    methods (Static)
        function obj = fromStruct(data)
            obj = GroundStationObject(data.Name, data.LatitudeDeg, ...
                data.LongitudeDeg, data.AltitudeMeters, data.MinElevationDeg);
            names = fieldnames(data);
            for k = 1:numel(names)
                if isprop(obj, names{k})
                    obj.(names{k}) = restoreSensorCellIfNeeded(data.(names{k}), names{k});
                end
            end
        end
    end
end
