classdef OrekitEphemeris
    %OREKITEPHEMERIS Build and resample suite ephemeris tables.

    methods (Static)
        function ephemeris = fromGcrfStates(timeVector, states)
            %FROMGCRFSTATES Full ephemeris table from GCRF states (n x 6, m and m/s).
            OrekitInitializer.initialize();
            timeVector = OrekitTime.ensureUtc(timeVector(:));
            n = numel(timeVector);

            inertialFrame = OrekitFrames.outputFrame("GCRF");
            earthFrame = OrekitFrames.earthFrame();
            earth = OrekitFrames.earthShape();

            ecefX = zeros(n, 1); ecefY = zeros(n, 1); ecefZ = zeros(n, 1);
            lat = zeros(n, 1); lon = zeros(n, 1); alt = zeros(n, 1);
            for k = 1:n
                date = OrekitTime.toAbsoluteDate(timeVector(k));
                transform = inertialFrame.getTransformTo(earthFrame, date);
                ecef = transform.transformPosition(javaObject( ...
                    "org.hipparchus.geometry.euclidean.threed.Vector3D", ...
                    states(k, 1), states(k, 2), states(k, 3)));
                ecefX(k) = ecef.getX(); ecefY(k) = ecef.getY(); ecefZ(k) = ecef.getZ();
                point = earth.transform(ecef, earthFrame, date);
                lat(k) = rad2deg(point.getLatitude());
                lon(k) = mod(rad2deg(point.getLongitude()) + 180.0, 360.0) - 180.0;
                alt(k) = point.getAltitude();
            end

            ephemeris = table(timeVector, states(:, 1), states(:, 2), states(:, 3), ...
                states(:, 4), states(:, 5), states(:, 6), ...
                ecefX, ecefY, ecefZ, lat, lon, alt, ...
                'VariableNames', {'Time', 'X_m', 'Y_m', 'Z_m', ...
                'VX_mps', 'VY_mps', 'VZ_mps', ...
                'ECEF_X_m', 'ECEF_Y_m', 'ECEF_Z_m', ...
                'LatitudeDeg', 'LongitudeDeg', 'AltitudeM'});
        end

        function ephemeris = resample(source, timeVector)
            %RESAMPLE Cubic-Hermite interpolation of a GCRF ephemeris table.
            %
            % source needs Time, X_m..Z_m, VX_mps..VZ_mps columns. The
            % requested times must lie within the source time span.
            timeVector = OrekitTime.ensureUtc(timeVector(:));
            sourceTime = OrekitTime.ensureUtc(source.Time);
            if timeVector(1) < sourceTime(1) || timeVector(end) > sourceTime(end)
                error("OrekitEphemeris:OutOfRange", ...
                    "Requested times fall outside the source ephemeris span (%s to %s).", ...
                    string(sourceTime(1)), string(sourceTime(end)));
            end

            tSrc = seconds(sourceTime - sourceTime(1));
            tQuery = seconds(timeVector - sourceTime(1));
            pos = [source.X_m, source.Y_m, source.Z_m];
            vel = [source.VX_mps, source.VY_mps, source.VZ_mps];

            idx = discretize(tQuery, tSrc);
            idx = min(max(idx, 1), numel(tSrc) - 1);
            h = tSrc(idx + 1) - tSrc(idx);
            s = (tQuery - tSrc(idx)) ./ h;

            h00 = 2 * s.^3 - 3 * s.^2 + 1;
            h10 = s.^3 - 2 * s.^2 + s;
            h01 = -2 * s.^3 + 3 * s.^2;
            h11 = s.^3 - s.^2;
            d00 = 6 * s.^2 - 6 * s;
            d10 = 3 * s.^2 - 4 * s + 1;
            d01 = -6 * s.^2 + 6 * s;
            d11 = 3 * s.^2 - 2 * s;

            p0 = pos(idx, :); p1 = pos(idx + 1, :);
            v0 = vel(idx, :); v1 = vel(idx + 1, :);
            posQuery = h00 .* p0 + (h10 .* h) .* v0 + h01 .* p1 + (h11 .* h) .* v1;
            velQuery = (d00 ./ h) .* p0 + d10 .* v0 + (d01 ./ h) .* p1 + d11 .* v1;

            ephemeris = OrekitEphemeris.fromGcrfStates(timeVector, [posQuery, velQuery]);
        end
    end
end
