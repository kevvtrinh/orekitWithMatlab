classdef CoverageGrid
    %COVERAGEGRID Latitude/longitude sample grid for coverage analysis.

    properties
        LatMinDeg double = -90
        LatMaxDeg double = 90
        LonMinDeg double = -180
        LonMaxDeg double = 180
        SpacingDeg double = 6
        AltitudeMeters double = 0
    end

    methods
        function obj = CoverageGrid(varargin)
            if mod(nargin, 2) ~= 0
                error("CoverageGrid:InvalidInputs", ...
                    "Use name-value pairs when constructing CoverageGrid.");
            end
            for k = 1:2:nargin
                name = varargin{k};
                if ~isprop(obj, name)
                    error("CoverageGrid:UnknownProperty", ...
                        "Unknown CoverageGrid property: %s", string(name));
                end
                obj.(name) = varargin{k + 1};
            end
        end

        function validate(obj)
            if obj.LatMinDeg >= obj.LatMaxDeg || obj.LatMinDeg < -90 || obj.LatMaxDeg > 90
                error("CoverageGrid:InvalidLatitudeBounds", ...
                    "Latitude bounds must satisfy -90 <= min < max <= 90.");
            end
            if obj.LonMinDeg >= obj.LonMaxDeg || obj.LonMinDeg < -180 || obj.LonMaxDeg > 180
                error("CoverageGrid:InvalidLongitudeBounds", ...
                    "Longitude bounds must satisfy -180 <= min < max <= 180.");
            end
            if obj.SpacingDeg <= 0
                error("CoverageGrid:InvalidSpacing", "SpacingDeg must be positive.");
            end
        end

        function pointTable = points(obj)
            %POINTS Grid point table with area weights (proportional to cos lat).
            obj.validate();
            lats = (obj.LatMinDeg:obj.SpacingDeg:obj.LatMaxDeg).';
            lons = (obj.LonMinDeg:obj.SpacingDeg:obj.LonMaxDeg).';
            [lonGrid, latGrid] = meshgrid(lons, lats);
            latitudeDeg = latGrid(:);
            longitudeDeg = lonGrid(:);
            pointId = (1:numel(latitudeDeg)).';
            areaWeight = max(cosd(latitudeDeg), 1e-6);
            areaWeight = areaWeight / sum(areaWeight);
            pointTable = table(pointId, latitudeDeg, longitudeDeg, areaWeight, ...
                'VariableNames', {'PointId', 'LatitudeDeg', 'LongitudeDeg', 'AreaWeight'});
        end
    end

    methods (Static)
        function obj = globalGrid(spacingDeg)
            if nargin < 1
                spacingDeg = 6;
            end
            obj = CoverageGrid("SpacingDeg", spacingDeg);
        end

        function obj = regionGrid(latMinDeg, latMaxDeg, lonMinDeg, lonMaxDeg, spacingDeg)
            if nargin < 5
                spacingDeg = 2;
            end
            obj = CoverageGrid("LatMinDeg", latMinDeg, "LatMaxDeg", latMaxDeg, ...
                "LonMinDeg", lonMinDeg, "LonMaxDeg", lonMaxDeg, ...
                "SpacingDeg", spacingDeg);
        end
    end
end
