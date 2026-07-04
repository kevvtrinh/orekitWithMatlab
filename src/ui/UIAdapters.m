classdef UIAdapters
    %UIADAPTERS Thin conversion helpers for future App Designer front ends.
    %
    % UI callbacks should collect control values, call these adapters to build
    % backend objects, then call backend methods/functions.

    methods (Static)
        function cfg = scenarioConfigFromStruct(values)
            cfg = ScenarioConfig.fromStruct(values);
        end

        function sat = satelliteFromKeplerianStruct(values)
            sat = SatelliteObject.fromKeplerian(values.Name, ...
                values.SemiMajorAxisMeters, values.Eccentricity, ...
                values.InclinationDeg, values.RAANDeg, ...
                values.ArgPerigeeDeg, values.TrueAnomalyDeg);
        end

        function gs = groundStationFromStruct(values)
            gs = GroundStationObject(values.Name, values.LatitudeDeg, ...
                values.LongitudeDeg, values.AltitudeMeters, values.MinElevationDeg);
        end
    end
end

