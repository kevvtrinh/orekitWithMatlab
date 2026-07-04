classdef SatelliteObject < MissionObject
    %SATELLITEOBJECT Satellite object with Orekit-backed propagation.

    properties
        OrbitDefinitionType string = "Keplerian"
        SemiMajorAxisMeters double = NaN
        Eccentricity double = NaN
        InclinationDeg double = NaN
        RAANDeg double = NaN
        ArgPerigeeDeg double = NaN
        TrueAnomalyDeg double = NaN
        CartesianState double = nan(1, 6)
        TLELine1 string = ""
        TLELine2 string = ""
        PropagatorType string = "Keplerian"
        MassKg double = 1000
        Attitude string = "Default"
        Sensors cell = {}
        Terminals cell = {}
        OrekitPropagator = []
        BodyModelType string = "Cube"
        BodyDimensionsMeters double = [1 1 1]
        BodyColor double = [0.72 0.76 0.80]
        ShowBodyFrame logical = true
        ShowSensorMounts logical = true
        VisualModel struct = struct()
    end

    methods
        function obj = SatelliteObject(name)
            obj.ObjectType = "Satellite";
            obj.Color = [0.86 0.12 0.11];
            if nargin > 0
                obj.Name = string(name);
            end
        end

        function validate(obj)
            validate@MissionObject(obj);
            switch obj.OrbitDefinitionType
                case "Keplerian"
                    values = [obj.SemiMajorAxisMeters, obj.Eccentricity, ...
                        obj.InclinationDeg, obj.RAANDeg, obj.ArgPerigeeDeg, obj.TrueAnomalyDeg];
                    if any(isnan(values))
                        error("SatelliteObject:IncompleteKeplerian", ...
                            "Keplerian satellite '%s' has incomplete elements.", obj.Name);
                    end
                    if obj.SemiMajorAxisMeters <= 0 || obj.Eccentricity < 0
                        error("SatelliteObject:InvalidKeplerian", ...
                            "Keplerian satellite '%s' has invalid elements.", obj.Name);
                    end
                case "Cartesian"
                    if any(isnan(obj.CartesianState))
                        error("SatelliteObject:IncompleteCartesian", ...
                            "Cartesian satellite '%s' has incomplete state.", obj.Name);
                    end
                case "TLE"
                    if strlength(obj.TLELine1) == 0 || strlength(obj.TLELine2) == 0
                        error("SatelliteObject:IncompleteTLE", ...
                            "TLE satellite '%s' requires two TLE lines.", obj.Name);
                    end
                otherwise
                    error("SatelliteObject:UnsupportedOrbitType", ...
                        "Unsupported orbit definition type: %s", obj.OrbitDefinitionType);
            end
        end

        function orbit = buildOrekitOrbit(obj, config)
            orbit = OrekitOrbitFactory.createOrbit(obj, config);
        end

        function propagator = buildOrekitPropagator(obj, config)
            propagator = OrekitPropagatorFactory.createPropagator(obj, config);
        end

        function obj = propagate(obj, timeVector, config)
            obj.validate();
            propagator = obj.buildOrekitPropagator(config);
            obj.OrekitPropagator = propagator;
            ephemeris = OrekitPropagatorFactory.propagate(propagator, timeVector);
            obj.Ephemeris = ephemeris;
            obj.IsPropagated = true;
        end

        function position = getECI(obj, time)
            position = obj.getPosition(time);
        end

        function position = getECEF(obj, time)
            if isempty(obj.Ephemeris) || ~all(ismember(["ECEF_X_m", "ECEF_Y_m", "ECEF_Z_m"], obj.Ephemeris.Properties.VariableNames))
                error("SatelliteObject:NoECEF", ...
                    "Satellite '%s' does not have ECEF ephemeris.", obj.Name);
            end
            [~, idx] = min(abs(obj.Ephemeris.Time - time));
            position = [obj.Ephemeris.ECEF_X_m(idx), obj.Ephemeris.ECEF_Y_m(idx), obj.Ephemeris.ECEF_Z_m(idx)];
        end

        function lla = getLLA(obj, time)
            if isempty(obj.Ephemeris) || ~all(ismember(["LatitudeDeg", "LongitudeDeg", "AltitudeM"], obj.Ephemeris.Properties.VariableNames))
                error("SatelliteObject:NoLLA", ...
                    "Satellite '%s' does not have LLA ephemeris.", obj.Name);
            end
            [~, idx] = min(abs(obj.Ephemeris.Time - time));
            lla = [obj.Ephemeris.LatitudeDeg(idx), obj.Ephemeris.LongitudeDeg(idx), obj.Ephemeris.AltitudeM(idx)];
        end

        function obj = addSensor(obj, sensor)
            sensor = sensor.attachTo(obj);
            if obj.hasSensor(sensor.Name)
                error("SatelliteObject:DuplicateSensor", ...
                    "Satellite '%s' already has a sensor named '%s'.", obj.Name, sensor.Name);
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
            error("SatelliteObject:SensorNotFound", ...
                "Sensor '%s' was not found on satellite '%s'.", string(sensorName), obj.Name);
        end
    end

    methods (Static)
        function obj = fromKeplerian(name, semiMajorAxisMeters, eccentricity, ...
                inclinationDeg, raanDeg, argPerigeeDeg, trueAnomalyDeg)
            obj = SatelliteObject(name);
            obj.OrbitDefinitionType = "Keplerian";
            obj.SemiMajorAxisMeters = semiMajorAxisMeters;
            obj.Eccentricity = eccentricity;
            obj.InclinationDeg = inclinationDeg;
            obj.RAANDeg = raanDeg;
            obj.ArgPerigeeDeg = argPerigeeDeg;
            obj.TrueAnomalyDeg = trueAnomalyDeg;
        end

        function obj = fromCartesian(name, stateVector)
            obj = SatelliteObject(name);
            obj.OrbitDefinitionType = "Cartesian";
            obj.CartesianState = reshape(stateVector, 1, 6);
        end

        function obj = fromTLE(name, line1, line2)
            obj = SatelliteObject(name);
            obj.OrbitDefinitionType = "TLE";
            obj.PropagatorType = "TLE";
            obj.TLELine1 = string(line1);
            obj.TLELine2 = string(line2);
        end

        function obj = fromStruct(data)
            obj = SatelliteObject(data.Name);
            names = fieldnames(data);
            for k = 1:numel(names)
                if isprop(obj, names{k}) && ~strcmp(names{k}, "OrekitPropagator")
                    obj.(names{k}) = restoreSensorCellIfNeeded(data.(names{k}), names{k});
                end
            end
            obj.OrekitPropagator = [];
        end
    end
end
