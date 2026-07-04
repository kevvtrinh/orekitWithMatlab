classdef TargetObject < PlaceObject
    %TARGETOBJECT Fixed Earth target for sensor access workflows.

    properties
        TargetType string = "Point"
        Priority double = 1
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
