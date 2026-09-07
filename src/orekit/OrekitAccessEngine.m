classdef OrekitAccessEngine
    %OREKITACCESSENGINE Geometry helpers for access calculations.

    methods (Static)
        function aer = azElRange(satellite, groundStation, timeVector)
            timeVector = OrekitTime.ensureUtc(timeVector(:));

            % Numeric history is authoritative, including between samples.
            % A final-segment propagator cannot reconstruct earlier burns.
            aer = OrekitAccessEngine.azElRangeFromEphemeris(satellite, groundStation, timeVector);
            if ~isempty(aer)
                return;
            end

            if isempty(satellite.OrekitPropagator)
                error("OrekitAccessEngine:MissingPropagator", ...
                    "Satellite '%s' must be propagated before access can be computed.", satellite.Name);
            end
            if ~isempty(satellite.Maneuvers)
                error("OrekitAccessEngine:MissingManeuverHistory", ...
                    "Satellite '%s' requires its propagated maneuver history.", satellite.Name);
            end
            n = numel(timeVector);
            az = zeros(n, 1);
            el = zeros(n, 1);
            rangeKm = zeros(n, 1);

            topo = groundStation.buildOrekitTopocentricFrame();
            earthFrame = OrekitFrames.earthFrame();

            for k = 1:n
                date = OrekitTime.toAbsoluteDate(timeVector(k));
                state = satellite.OrekitPropagator.propagate(date);
                position = state.getPosition(earthFrame);
                az(k) = mod(rad2deg(topo.getAzimuth(position, earthFrame, date)), 360.0);
                el(k) = rad2deg(topo.getElevation(position, earthFrame, date));
                rangeKm(k) = topo.getRange(position, earthFrame, date) / 1000.0;
            end

            aer = table(timeVector, az, el, rangeKm, ...
                'VariableNames', {'Time', 'AzimuthDeg', 'ElevationDeg', 'RangeKm'});
        end

        function aer = azElRangeFromEphemeris(satellite, groundStation, timeVector)
            %AZELRANGEFROMEPHEMERIS Segment-aware geometry from numeric states.
            % Returns [] only when no numeric ephemeris is available.
            aer = [];
            ephemeris = satellite.Ephemeris;
            if isempty(ephemeris) || ~ismember("Time", ephemeris.Properties.VariableNames)
                return;
            end
            hasGcrf = all(ismember( ...
                ["X_m", "Y_m", "Z_m", "VX_mps", "VY_mps", "VZ_mps"], ...
                ephemeris.Properties.VariableNames));
            hasEcef = all(ismember(["ECEF_X_m", "ECEF_Y_m", "ECEF_Z_m"], ...
                ephemeris.Properties.VariableNames));
            if ~hasGcrf && ~hasEcef
                return;
            end
            if any(timeVector < ephemeris.Time(1) | timeVector > ephemeris.Time(end)) || ...
                    any(isnat(timeVector))
                error("OrekitAccessEngine:OutsideEphemeris", ...
                    "Access times must lie within satellite '%s' ephemeris span.", ...
                    satellite.Name);
            end
            ecef = zeros(numel(timeVector), 3);
            [found, indices] = ismember(timeVector, ephemeris.Time);
            if any(~found) && ~hasGcrf
                error("OrekitAccessEngine:MissingStateColumns", ...
                    "Off-grid access requires GCRF position and velocity history.");
            end
            for timeIndex = 1:numel(timeVector)
                if found(timeIndex) && hasEcef
                    row = indices(timeIndex);
                    ecef(timeIndex, :) = [ephemeris.ECEF_X_m(row), ...
                        ephemeris.ECEF_Y_m(row), ephemeris.ECEF_Z_m(row)];
                else
                    state = satellite.getState(timeVector(timeIndex));
                    ecef(timeIndex, :) = OrekitFrameTransform.gcrfToEcef( ...
                        timeVector(timeIndex), state(1:3));
                end
            end
            [az, el, rangeM] = enuAzElRange(groundStation.LatitudeDeg, ...
                groundStation.LongitudeDeg, groundStation.AltitudeMeters, ecef);
            aer = table(timeVector, az, el, rangeM / 1000.0, ...
                'VariableNames', {'Time', 'AzimuthDeg', 'ElevationDeg', 'RangeKm'});
        end
    end
end
