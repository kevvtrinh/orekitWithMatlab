classdef PointTarget
    %POINTTARGET Passive point target fixed to the WGS84 Earth.
    %
    % Construction:
    %   target = scenario.target.PointTarget( ...
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
        function target = PointTarget( ...
                name, latitude_deg, longitude_deg, altitude_m)
            % Create a passive Earth-fixed point target.
            % Coordinates are WGS84 geodetic values and are never silently clipped
            % or wrapped.

            name = string(name);
            isValidName = isscalar(name) && ~ismissing(name) && strlength(name) > 0;
            if ~isValidName
                error("PointTarget:InvalidName", ...
                    "Target name must be nonempty scalar text.");
            end

            validateattributes(latitude_deg, {'numeric'}, ...
                {'real', 'finite', 'scalar'}, ...
                "PointTarget", "latitude_deg");
            validateattributes(longitude_deg, {'numeric'}, ...
                {'real', 'finite', 'scalar'}, ...
                "PointTarget", "longitude_deg");
            validateattributes(altitude_m, {'numeric'}, ...
                {'real', 'finite', 'scalar'}, ...
                "PointTarget", "altitude_m");

            if latitude_deg < -90 || latitude_deg > 90
                error("PointTarget:InvalidLatitude", ...
                    "latitude_deg must be between -90 and 90 degrees; got %g.", ...
                    latitude_deg);
            end
            if longitude_deg < -180 || longitude_deg > 180
                error("PointTarget:InvalidLongitude", ...
                    "longitude_deg must be between -180 and 180 degrees; got %g.", ...
                    longitude_deg);
            end

            target.Name = name;
            target.Latitude_deg = double(latitude_deg);
            target.Longitude_deg = double(longitude_deg);
            target.Altitude_m = double(altitude_m);
            target.Body = "Earth";
            target.ReferenceSurface = "WGS84";
        end
    end
end
