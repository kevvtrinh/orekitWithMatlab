classdef OrekitAccessEngine
    %OREKITACCESSENGINE Geometry helpers for access calculations.

    methods (Static)
        function aer = azElRange(satellite, groundStation, timeVector)
            if isempty(satellite.OrekitPropagator)
                error("OrekitAccessEngine:MissingPropagator", ...
                    "Satellite '%s' must be propagated before access can be computed.", satellite.Name);
            end

            timeVector = OrekitTime.ensureUtc(timeVector(:));
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
    end
end
