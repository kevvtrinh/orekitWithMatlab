classdef Place
    %PLACE Passive named location fixed to the WGS84 Earth.
    %
    % Construction:
    %   place = scenario.target.Place( ...
    %       name, latitude_deg, longitude_deg, altitude_m)
    %
    % The value object has no sensors or mutable lifecycle. Latitude is geodetic
    % degrees north, longitude is degrees east, and altitude is ellipsoidal metres.

    properties (SetAccess = private)
        Name
        Latitude_deg
        Longitude_deg
        Altitude_m
        Body
        ReferenceSurface
    end

    methods
        function place = Place(name, latitude_deg, longitude_deg, altitude_m)
            % Create a passive named WGS84 location.

            point = scenario.target.PointTarget( ...
                name, latitude_deg, longitude_deg, altitude_m);

            place.Name = point.Name;
            place.Latitude_deg = point.Latitude_deg;
            place.Longitude_deg = point.Longitude_deg;
            place.Altitude_m = point.Altitude_m;
            place.Body = point.Body;
            place.ReferenceSurface = point.ReferenceSurface;
        end
    end
end

