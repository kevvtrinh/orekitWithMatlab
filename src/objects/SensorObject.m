classdef SensorObject < MissionObject
    %SENSOROBJECT STK-like sensor/payload definition attached to a parent object.

    properties
        ParentName string = ""
        ParentObjectName string = ""
        ParentType string = ""
        SensorType string = "SimpleConic"
        PointingMode string = "Nadir"
        MountingFrame string = "Parent"
        BoresightFrame string = "Parent"
        BoresightVector double = [0 0 1]
        UpVector double = [0 0 1]
        FieldOfViewType string = "SimpleConic"
        FieldOfViewShape string = "Cone"
        FieldOfViewDeg double = NaN
        FieldOfRegardDeg double = 180
        ConeHalfAngleDeg double = 20
        InnerHalfAngleDeg double = 0
        OuterHalfAngleDeg double = 20
        RectangularHalfAngleXDeg double = 10
        RectangularHalfAngleYDeg double = 10
        CustomFovBoundary table = table()
        MinRangeKm double = 0
        MaxRangeKm double = Inf
        MinElevationDeg double = 0
        MaxLookAngleDeg double = 180
        MinLookAngleDeg double = 0
        MinOffNadirDeg double = 0
        MaxOffNadirDeg double = 180
        SlewRateDegPerSec double = Inf
        SlewAccelerationDegPerSec2 double = Inf
        MaxSlewRateDegPerSec double = Inf
        MaxSlewAccelDegPerSec2 double = Inf
        SettlingTimeSeconds double = 0
        MinDwellTimeSeconds double = 0
        MaxDwellTimeSeconds double = Inf
        ScanRateDegPerSec double = Inf
        SwathWidthKm double = NaN
        ResolutionModel string = "None"
        DataRateBps double = 0
        PowerWatts double = 0
        CurrentPointingTarget string = ""
        PreviousPointingTarget string = ""
        AvailabilityWindows table = table()
        CurrentPointingState struct = struct()
        TaskQueue cell = {}
        Constraints struct = struct()
        Metadata struct = struct()
        MountLocationBody double = [0 0 -0.5]
        MountNormalBody double = [0 0 -1]
        BoresightBody double = [0 0 -1]
        SensorBodyFrame string = "Body"
        MountFace string = "-Z"
        MountOffsetMeters double = [0 0 0]
        SensorSizeMeters double = [0.18 0.18 0.12]
        ShowInViewer logical = true
        FOVVisible logical = true
        FORVisible logical = false
        BoresightVisible logical = true
        LabelVisible logical = true
    end

    methods
        function obj = SensorObject(name, parentName)
            obj.ObjectType = "Sensor";
            obj.Color = [0.95 0.58 0.12];
            if nargin >= 1
                obj.Name = string(name);
            end
            if nargin >= 2
                obj.ParentName = string(parentName);
                obj.ParentObjectName = string(parentName);
            end
        end

        function validate(obj)
            validate@MissionObject(obj);
            if strlength(strtrim(obj.ParentName)) == 0 && strlength(strtrim(obj.ParentObjectName)) > 0
                obj.ParentName = obj.ParentObjectName;
            end
            if strlength(strtrim(obj.ParentName)) == 0
                error("SensorObject:MissingParent", ...
                    "Sensor '%s' must have a ParentName.", obj.Name);
            end
            if obj.effectiveConeHalfAngleDeg() < 0 || obj.effectiveConeHalfAngleDeg() > 180
                error("SensorObject:InvalidConeHalfAngle", ...
                    "Cone half-angle must be between 0 and 180 degrees.");
            end
            if obj.RectangularHalfAngleXDeg < 0 || obj.RectangularHalfAngleYDeg < 0
                error("SensorObject:InvalidRectangularFov", ...
                    "Rectangular half-angles must be nonnegative.");
            end
            if obj.MinRangeKm < 0 || obj.MaxRangeKm < obj.MinRangeKm
                error("SensorObject:InvalidRange", ...
                    "Sensor range constraints are invalid.");
            end
            if obj.MinElevationDeg < -90 || obj.MinElevationDeg > 90
                error("SensorObject:InvalidMinElevation", ...
                    "Minimum elevation must be between -90 and 90 degrees.");
            end
            if norm(obj.BoresightVector) == 0
                error("SensorObject:InvalidBoresight", ...
                    "BoresightVector cannot be zero.");
            end
            if norm(obj.UpVector) == 0
                error("SensorObject:InvalidUpVector", ...
                    "UpVector cannot be zero.");
            end
            if norm(obj.BoresightBody) == 0
                error("SensorObject:InvalidBoresightBody", ...
                    "BoresightBody cannot be zero.");
            end
            if norm(obj.MountNormalBody) == 0
                error("SensorObject:InvalidMountNormal", ...
                    "MountNormalBody cannot be zero.");
            end
        end

        function obj = attachTo(obj, parentObject)
            obj.ParentName = string(parentObject.Name);
            obj.ParentObjectName = string(parentObject.Name);
            obj.ParentType = string(parentObject.ObjectType);
            obj.validate();
        end

        function obj = detach(obj)
            obj.ParentName = "";
            obj.ParentObjectName = "";
            obj.ParentType = "";
        end

        function name = getParentName(obj)
            name = obj.ParentName;
        end

        function boresight = getBoresightVector(obj, time, scenario, targetName)
            if nargin < 4
                targetName = "";
            end

            parent = scenario.getObject(obj.ParentName);
            parentPosition = SensorObject.objectPositionECEF(parent, time);
            pointingMode = upper(string(obj.PointingMode));

            switch pointingMode
                case {"TARGETED", "TARGET"}
                    pointingTarget = obj.CurrentPointingTarget;
                    if strlength(pointingTarget) == 0
                        pointingTarget = string(targetName);
                    end
                    if strlength(pointingTarget) == 0
                        error("SensorObject:MissingPointingTarget", ...
                            "Targeted sensor '%s' requires a pointing target.", obj.Name);
                    end
                    target = scenario.getObject(pointingTarget);
                    boresight = SensorObject.objectPositionECEF(target, time) - parentPosition;

                case {"NADIR", "NADIRPOINTING"}
                    if isa(parent, "SatelliteObject")
                        boresight = -parentPosition;
                    else
                        boresight = SensorObject.localEnuVectorToECEF(parent, [0 0 1]);
                    end

                case {"FIXEDVECTOR", "BODYFIXED"}
                    if isa(parent, "SatelliteObject")
                        boresight = reshape(obj.BoresightVector, 1, 3);
                    else
                        boresight = SensorObject.localEnuVectorToECEF(parent, obj.BoresightVector);
                    end

                case "VELOCITYVECTOR"
                    if ~isa(parent, "SatelliteObject")
                        boresight = SensorObject.localEnuVectorToECEF(parent, [0 0 1]);
                    else
                        state = parent.getState(time);
                        boresight = state(4:6);
                    end

                case {"SUNPOINTING", "SUN"}
                    sunEcef = OrekitBodies.sunPositions(time, "ECEF");
                    boresight = [sunEcef.X_m(1), sunEcef.Y_m(1), sunEcef.Z_m(1)] ...
                        - parentPosition;

                otherwise
                    boresight = reshape(obj.BoresightVector, 1, 3);
            end

            boresight = SensorObject.unitVector(boresight);
        end

        function geometry = getFieldOfViewGeometry(obj, time, scenario)
            geometry = struct();
            geometry.SensorName = obj.Name;
            geometry.ParentName = obj.ParentName;
            geometry.Time = time;
            geometry.FieldOfViewType = obj.FieldOfViewType;
            geometry.BoresightVector = obj.getBoresightVector(time, scenario);
            geometry.ConeHalfAngleDeg = obj.effectiveConeHalfAngleDeg();
            geometry.FieldOfViewDeg = obj.effectiveConeHalfAngleDeg();
            geometry.FieldOfRegardDeg = obj.FieldOfRegardDeg;
            geometry.RectangularHalfAngleXDeg = obj.RectangularHalfAngleXDeg;
            geometry.RectangularHalfAngleYDeg = obj.RectangularHalfAngleYDeg;
        end

        function look = computeLookVector(obj, scenario, targetName, timeVector)
            parent = scenario.getObject(obj.ParentName);
            target = scenario.getObject(targetName);
            timeVector = timeVector(:);
            n = numel(timeVector);
            lx = zeros(n, 1); ly = zeros(n, 1); lz = zeros(n, 1);
            rangeKm = zeros(n, 1);

            for k = 1:n
                parentPosition = SensorObject.objectPositionECEF(parent, timeVector(k));
                targetPosition = SensorObject.objectPositionECEF(target, timeVector(k));
                vector = targetPosition - parentPosition;
                rangeKm(k) = norm(vector) / 1000.0;
                unitLook = SensorObject.unitVector(vector);
                lx(k) = unitLook(1);
                ly(k) = unitLook(2);
                lz(k) = unitLook(3);
            end

            look = table(timeVector, lx, ly, lz, rangeKm, ...
                'VariableNames', {'Time', 'LookX', 'LookY', 'LookZ', 'RangeKm'});
        end

        function angles = computeLookAngles(obj, scenario, targetName, timeVector)
            look = obj.computeLookVector(scenario, targetName, timeVector);
            n = height(look);
            offBoresightAngleDeg = zeros(n, 1);
            for k = 1:n
                boresight = obj.getBoresightVector(look.Time(k), scenario, targetName);
                lookVector = [look.LookX(k), look.LookY(k), look.LookZ(k)];
                offBoresightAngleDeg(k) = SensorObject.vectorAngleDeg(boresight, lookVector);
            end
            angles = table(look.Time, offBoresightAngleDeg, look.RangeKm, ...
                'VariableNames', {'Time', 'OffBoresightAngleDeg', 'RangeKm'});
        end

        function accessLogical = canSeeTarget(obj, scenario, targetName, timeVector, options)
            if nargin < 5
                options = struct();
            end
            result = computeSensorAccess(scenario, obj.ParentName, obj.Name, targetName, options);
            if nargin >= 4 && ~isempty(timeVector)
                [~, idx] = ismember(timeVector(:), result.TimeVector);
                accessLogical = false(numel(timeVector), 1);
                valid = idx > 0;
                accessLogical(valid) = result.AccessLogical(idx(valid));
            else
                accessLogical = result.AccessLogical;
            end
        end

        function tf = isInsideFieldOfView(obj, lookVector, boresightVector)
            lookVector = SensorObject.unitVector(lookVector);
            boresightVector = SensorObject.unitVector(boresightVector);
            offBoresightDeg = SensorObject.vectorAngleDeg(boresightVector, lookVector);

            switch upper(string(obj.FieldOfViewType))
                case {"SIMPLECONIC", "CONIC", "CIRCULAR"}
                    tf = offBoresightDeg <= obj.effectiveConeHalfAngleDeg();
                case "RECTANGULAR"
                    [xAngleDeg, yAngleDeg] = obj.rectangularAnglesDeg(lookVector, boresightVector);
                    tf = abs(xAngleDeg) <= obj.RectangularHalfAngleXDeg && ...
                        abs(yAngleDeg) <= obj.RectangularHalfAngleYDeg;
                case {"COMPLEXCONIC", "ANNULAR"}
                    tf = offBoresightDeg >= obj.InnerHalfAngleDeg && ...
                        offBoresightDeg <= obj.OuterHalfAngleDeg;
                otherwise
                    tf = false;
            end
        end

        function [xAngleDeg, yAngleDeg] = rectangularAnglesDeg(obj, lookVector, boresightVector)
            boresightVector = SensorObject.unitVector(boresightVector);
            lookVector = SensorObject.unitVector(lookVector);
            up = SensorObject.unitVector(obj.UpVector);
            up = up - dot(up, boresightVector) * boresightVector;
            if norm(up) < 1e-12
                up = SensorObject.anyPerpendicular(boresightVector);
            else
                up = SensorObject.unitVector(up);
            end
            xAxis = SensorObject.unitVector(cross(up, boresightVector));
            yAxis = SensorObject.unitVector(cross(boresightVector, xAxis));
            forward = max(dot(lookVector, boresightVector), eps);
            xAngleDeg = atan2d(dot(lookVector, xAxis), forward);
            yAngleDeg = atan2d(dot(lookVector, yAxis), forward);
        end

        function newObj = copy(obj)
            newObj = obj;
        end

        function obj = addTask(obj, task)
            obj.TaskQueue{end + 1} = task;
        end

        function obj = removeTask(obj, taskID)
            keep = true(size(obj.TaskQueue));
            for k = 1:numel(obj.TaskQueue)
                item = obj.TaskQueue{k};
                if isobject(item) && isprop(item, "TaskID")
                    keep(k) = string(item.TaskID) ~= string(taskID);
                elseif isstruct(item) && isfield(item, "TaskID")
                    keep(k) = string(item.TaskID) ~= string(taskID);
                end
            end
            obj.TaskQueue = obj.TaskQueue(keep);
        end

        function obj = clearTasks(obj)
            obj.TaskQueue = {};
        end

        function tasks = listTasks(obj)
            if isempty(obj.TaskQueue)
                tasks = table(strings(0, 1), strings(0, 1), strings(0, 1), ...
                    'VariableNames', {'TaskID', 'TaskName', 'TaskType'});
                return;
            end
            taskID = strings(numel(obj.TaskQueue), 1);
            taskName = strings(numel(obj.TaskQueue), 1);
            taskType = strings(numel(obj.TaskQueue), 1);
            for k = 1:numel(obj.TaskQueue)
                item = obj.TaskQueue{k};
                if isobject(item) || isstruct(item)
                    taskID(k) = string(item.TaskID);
                    taskName(k) = string(item.TaskName);
                    taskType(k) = string(item.TaskType);
                end
            end
            tasks = table(taskID, taskName, taskType, ...
                'VariableNames', {'TaskID', 'TaskName', 'TaskType'});
        end

        function accessLogical = canObserveTarget(obj, scenario, targetName, timeVector, options)
            if nargin < 5
                options = struct();
            end
            accessLogical = obj.canSeeTarget(scenario, targetName, timeVector, options);
        end

        function opportunities = computeObservationWindows(obj, scenario, task, options)
            if nargin < 4
                options = SchedulerOptions();
            end
            task.AssignedSensorName = obj.Name;
            task.AssignedPlatformName = obj.ParentName;
            task.AllowedSensorNames = obj.Name;
            opportunities = computeSensorTaskOpportunities(scenario, task, options);
        end

        function opportunities = computeScanOpportunities(obj, scenario, task, options)
            if nargin < 4
                options = SchedulerOptions();
            end
            task.AssignedSensorName = obj.Name;
            task.AssignedPlatformName = obj.ParentName;
            task.AllowedSensorNames = obj.Name;
            opportunities = computeAreaScanOpportunities(scenario, task, options);
        end

        function slewTimeSeconds = computeSlewTime(obj, fromPointing, toPointing)
            slewAngleDeg = computeSlewAngle(fromPointing, toPointing);
            slewTimeSeconds = computeSlewTime(slewAngleDeg, ...
                obj.effectiveSlewRateDegPerSec(), obj.effectiveSlewAccelDegPerSec2()) + ...
                obj.SettlingTimeSeconds;
        end

        function dataVolumeMb = estimateDataVolume(obj, ~, durationSeconds)
            dataVolumeMb = obj.DataRateBps .* max(durationSeconds, 0) ./ 8 ./ 1e6;
        end

        function quality = estimateObservationQuality(obj, ~, geometry)
            quality = 1.0;
            if isstruct(geometry)
                if isfield(geometry, "MeanOffNadirDeg") && isfinite(geometry.MeanOffNadirDeg)
                    quality = quality * max(0, 1 - geometry.MeanOffNadirDeg / max(obj.FieldOfRegardDeg, eps));
                end
                if isfield(geometry, "MeanRangeKm") && isfinite(geometry.MeanRangeKm) && isfinite(obj.MaxRangeKm)
                    quality = quality * max(0, 1 - geometry.MeanRangeKm / max(obj.MaxRangeKm, eps));
                end
            end
        end

        function angleDeg = effectiveConeHalfAngleDeg(obj)
            if isfinite(obj.FieldOfViewDeg) && obj.FieldOfViewDeg > 0
                angleDeg = obj.FieldOfViewDeg;
            else
                angleDeg = obj.ConeHalfAngleDeg;
            end
        end

        function slewRate = effectiveSlewRateDegPerSec(obj)
            if isfinite(obj.MaxSlewRateDegPerSec) && obj.MaxSlewRateDegPerSec > 0
                slewRate = obj.MaxSlewRateDegPerSec;
            else
                slewRate = obj.SlewRateDegPerSec;
            end
        end

        function slewAccel = effectiveSlewAccelDegPerSec2(obj)
            if isfinite(obj.MaxSlewAccelDegPerSec2) && obj.MaxSlewAccelDegPerSec2 > 0
                slewAccel = obj.MaxSlewAccelDegPerSec2;
            else
                slewAccel = obj.SlewAccelerationDegPerSec2;
            end
        end
    end

    methods (Static)
        function obj = simpleConic(name, parentName, coneHalfAngleDeg)
            obj = SensorObject(name, parentName);
            obj.SensorType = "SimpleConic";
            obj.FieldOfViewType = "SimpleConic";
            obj.FieldOfViewShape = "Cone";
            obj.ConeHalfAngleDeg = coneHalfAngleDeg;
            obj.FieldOfViewDeg = coneHalfAngleDeg;
            obj.PointingMode = "Nadir";
        end

        function obj = conical(name, parentName, coneHalfAngleDeg)
            obj = SensorObject.simpleConic(name, parentName, coneHalfAngleDeg);
        end

        function obj = rectangular(name, parentName, halfAngleXDeg, halfAngleYDeg)
            obj = SensorObject(name, parentName);
            obj.SensorType = "Rectangular";
            obj.FieldOfViewType = "Rectangular";
            obj.FieldOfViewShape = "Rectangular";
            obj.RectangularHalfAngleXDeg = halfAngleXDeg;
            obj.RectangularHalfAngleYDeg = halfAngleYDeg;
            obj.FieldOfViewDeg = max([halfAngleXDeg, halfAngleYDeg]);
            obj.PointingMode = "Nadir";
        end

        function obj = fixedVector(name, parentName, boresightVector, coneHalfAngleDeg)
            if nargin < 4
                coneHalfAngleDeg = 20;
            end
            obj = SensorObject.simpleConic(name, parentName, coneHalfAngleDeg);
            obj.SensorType = "FixedVector";
            obj.PointingMode = "FixedVector";
            obj.BoresightVector = reshape(boresightVector, 1, 3);
        end

        function obj = targeted(name, parentName, targetName, coneHalfAngleDeg)
            if nargin < 4
                coneHalfAngleDeg = 20;
            end
            obj = SensorObject.simpleConic(name, parentName, coneHalfAngleDeg);
            obj.SensorType = "Targeted";
            obj.PointingMode = "Targeted";
            obj.CurrentPointingTarget = string(targetName);
        end

        function obj = fromStruct(data)
            obj = SensorObject(data.Name, data.ParentName);
            names = fieldnames(data);
            for k = 1:numel(names)
                if isprop(obj, names{k})
                    obj.(names{k}) = data.(names{k});
                end
            end
        end

        function position = objectPositionECEF(missionObject, time)
            if isa(missionObject, "SatelliteObject")
                position = missionObject.getECEF(time);
            elseif ismethod(missionObject, "getECEF")
                position = missionObject.getECEF(time);
            elseif ismethod(missionObject, "getPosition")
                position = missionObject.getPosition(time);
            else
                error("SensorObject:UnsupportedPositionObject", ...
                    "Object '%s' does not provide an ECEF position.", missionObject.Name);
            end
            position = reshape(position, 1, 3);
        end

        function vector = localEnuVectorToECEF(missionObject, enuVector)
            [latDeg, lonDeg] = SensorObject.objectLatLon(missionObject);
            east = [-sind(lonDeg), cosd(lonDeg), 0];
            north = [-sind(latDeg) * cosd(lonDeg), ...
                -sind(latDeg) * sind(lonDeg), cosd(latDeg)];
            up = [cosd(latDeg) * cosd(lonDeg), ...
                cosd(latDeg) * sind(lonDeg), sind(latDeg)];
            enuVector = reshape(enuVector, 1, 3);
            vector = enuVector(1) * east + enuVector(2) * north + enuVector(3) * up;
            vector = SensorObject.unitVector(vector);
        end

        function [latDeg, lonDeg] = objectLatLon(missionObject)
            if isprop(missionObject, "LatitudeDeg") && isprop(missionObject, "LongitudeDeg")
                latDeg = missionObject.LatitudeDeg;
                lonDeg = missionObject.LongitudeDeg;
            else
                error("SensorObject:NoFixedLocation", ...
                    "Object '%s' does not have a fixed latitude/longitude.", missionObject.Name);
            end
        end

        function unit = unitVector(vector)
            vector = reshape(vector, 1, 3);
            magnitude = norm(vector);
            if magnitude == 0
                unit = [NaN NaN NaN];
            else
                unit = vector ./ magnitude;
            end
        end

        function angleDeg = vectorAngleDeg(a, b)
            a = SensorObject.unitVector(a);
            b = SensorObject.unitVector(b);
            value = min(1.0, max(-1.0, dot(a, b)));
            angleDeg = acosd(value);
        end

        function vector = anyPerpendicular(reference)
            reference = SensorObject.unitVector(reference);
            if abs(dot(reference, [0 0 1])) < 0.9
                seed = [0 0 1];
            else
                seed = [0 1 0];
            end
            vector = SensorObject.unitVector(cross(reference, seed));
        end
    end
end
