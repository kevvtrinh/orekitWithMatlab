classdef FacilityObject < GroundStationObject
    %FACILITYOBJECT Ground facility alias with sensor support.

    properties
        Metadata struct = struct()
    end

    methods
        function obj = FacilityObject(name, latitudeDeg, longitudeDeg, altitudeMeters, minElevationDeg)
            if nargin < 1
                name = "";
            end
            if nargin < 2
                latitudeDeg = 0;
                longitudeDeg = 0;
                altitudeMeters = 0;
            end
            if nargin < 5
                minElevationDeg = 5;
            end
            obj@GroundStationObject(name, latitudeDeg, longitudeDeg, altitudeMeters, minElevationDeg);
            obj.ObjectType = "Facility";
            obj.Color = [0.10 0.30 0.88];
        end
    end

    methods (Static)
        function obj = fromStruct(data)
            obj = FacilityObject(data.Name, data.LatitudeDeg, ...
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
