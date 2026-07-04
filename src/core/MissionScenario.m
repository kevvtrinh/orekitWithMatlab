classdef MissionScenario
    %MISSIONSCENARIO UI-independent mission scenario model.

    properties
        Config ScenarioConfig = ScenarioConfig()
        Objects cell = {}
        PropagationResults struct = struct()
        AccessResults struct = struct()
        CurrentAnimationTime = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC")
        Metadata struct = struct()
    end

    methods
        function obj = MissionScenario(config)
            if nargin > 0
                obj.Config = config;
            end
            obj.Config.validate();
            obj.CurrentAnimationTime = obj.Config.Epoch;
        end

        function obj = addObject(obj, missionObject)
            missionObject.validate();
            if obj.hasObject(missionObject.Name)
                error("MissionScenario:DuplicateObject", ...
                    "An object named '%s' already exists.", missionObject.Name);
            end
            obj.Objects{end + 1} = missionObject;
        end

        function obj = removeObject(obj, name)
            idx = obj.findObjectIndex(name);
            obj.Objects(idx) = [];
        end

        function missionObject = getObject(obj, name)
            missionObject = obj.Objects{obj.findObjectIndex(name)};
        end

        function obj = updateObject(obj, missionObject)
            missionObject.validate();
            idx = obj.findObjectIndex(missionObject.Name);
            obj.Objects{idx} = missionObject;
        end

        function tf = hasObject(obj, name)
            tf = false;
            for k = 1:numel(obj.Objects)
                if strcmp(string(obj.Objects{k}.Name), string(name))
                    tf = true;
                    return;
                end
            end
        end

        function names = listObjects(obj)
            names = strings(numel(obj.Objects), 1);
            types = strings(numel(obj.Objects), 1);
            propagated = false(numel(obj.Objects), 1);
            for k = 1:numel(obj.Objects)
                names(k) = obj.Objects{k}.Name;
                types(k) = obj.Objects{k}.ObjectType;
                propagated(k) = obj.Objects{k}.IsPropagated;
            end
            names = table(names, types, propagated, ...
                'VariableNames', {'Name', 'ObjectType', 'IsPropagated'});
        end

        function obj = propagate(obj)
            obj = propagateScenario(obj);
        end

        function result = computeAccess(obj, sourceName, targetName, options)
            arguments
                obj
                sourceName
                targetName
                options struct = struct()
            end
            result = computeAccessCore(obj, sourceName, targetName, options);
        end

        function handles = animate(obj, options)
            arguments
                obj
                options struct = struct()
            end
            handles = animateScenario(obj, options);
        end

        function save(obj, filename)
            saveScenario(obj, filename);
        end

        function exportResults(obj, folder)
            if ~isfolder(folder)
                mkdir(folder);
            end
            exportEphemeris(obj, fullfile(folder, "ephemeris"));
            accessNames = fieldnames(obj.AccessResults);
            for k = 1:numel(accessNames)
                exportAccessReport(obj.AccessResults.(accessNames{k}), ...
                    fullfile(folder, [accessNames{k} '.csv']));
            end
        end

        function data = toStruct(obj)
            data = struct();
            data.Config = obj.Config.toStruct();
            data.Objects = cell(size(obj.Objects));
            for k = 1:numel(obj.Objects)
                data.Objects{k} = obj.Objects{k}.toStruct();
            end
            data.PropagationResults = obj.PropagationResults;
            data.AccessResults = obj.AccessResults;
            data.CurrentAnimationTime = obj.CurrentAnimationTime;
            data.Metadata = obj.Metadata;
        end
    end

    methods (Access = private)
        function idx = findObjectIndex(obj, name)
            for k = 1:numel(obj.Objects)
                if strcmp(string(obj.Objects{k}.Name), string(name))
                    idx = k;
                    return;
                end
            end
            error("MissionScenario:ObjectNotFound", ...
                "Object '%s' was not found in the scenario.", string(name));
        end
    end

    methods (Static)
        function obj = fromStruct(data)
            obj = MissionScenario(ScenarioConfig.fromStruct(data.Config));
            for k = 1:numel(data.Objects)
                item = data.Objects{k};
                switch string(item.ObjectType)
                    case "Satellite"
                        missionObject = SatelliteObject.fromStruct(item);
                    case "GroundStation"
                        missionObject = GroundStationObject.fromStruct(item);
                    case "Place"
                        missionObject = PlaceObject.fromStruct(item);
                    case "Target"
                        missionObject = TargetObject.fromStruct(item);
                    case "AreaTarget"
                        missionObject = AreaTargetObject.fromStruct(item);
                    case "Facility"
                        missionObject = FacilityObject.fromStruct(item);
                    case "Sensor"
                        missionObject = SensorObject.fromStruct(item);
                    otherwise
                        error("MissionScenario:UnsupportedObjectType", ...
                            "Unsupported object type: %s", item.ObjectType);
                end
                obj = obj.addObject(missionObject);
            end
            if isfield(data, "PropagationResults")
                obj.PropagationResults = data.PropagationResults;
            end
            if isfield(data, "AccessResults")
                obj.AccessResults = data.AccessResults;
            end
            if isfield(data, "CurrentAnimationTime")
                obj.CurrentAnimationTime = data.CurrentAnimationTime;
            end
            if isfield(data, "Metadata")
                obj.Metadata = data.Metadata;
            end
        end
    end
end
