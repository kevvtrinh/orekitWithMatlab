classdef OrekitPropagatorFactory
    %OREKITPROPAGATORFACTORY Construct and run Orekit propagators.

    methods (Static)
        function propagator = createPropagator(satellite, config)
            OrekitInitializer.initialize();
            switch satellite.OrbitDefinitionType
                case "TLE"
                    tle = javaObject("org.orekit.propagation.analytical.tle.TLE", ...
                        char(satellite.TLELine1), char(satellite.TLELine2));
                    propagator = javaMethod("selectExtrapolator", ...
                        "org.orekit.propagation.analytical.tle.TLEPropagator", tle);
                otherwise
                    orbit = OrekitOrbitFactory.createOrbit(satellite, config);
                    propagator = javaObject("org.orekit.propagation.analytical.KeplerianPropagator", orbit);
            end
        end

        function ephemeris = propagate(propagator, timeVector)
            timeVector = OrekitTime.ensureUtc(timeVector(:));
            n = numel(timeVector);
            x = zeros(n, 1); y = zeros(n, 1); z = zeros(n, 1);
            vx = zeros(n, 1); vy = zeros(n, 1); vz = zeros(n, 1);
            ecefX = zeros(n, 1); ecefY = zeros(n, 1); ecefZ = zeros(n, 1);
            lat = zeros(n, 1); lon = zeros(n, 1); alt = zeros(n, 1);

            inertialFrame = OrekitFrames.outputFrame("GCRF");
            earthFrame = OrekitFrames.earthFrame();
            earth = OrekitFrames.earthShape();

            for k = 1:n
                date = OrekitTime.toAbsoluteDate(timeVector(k));
                state = propagator.propagate(date);
                pv = state.getPVCoordinates(inertialFrame);
                p = pv.getPosition();
                v = pv.getVelocity();
                x(k) = p.getX(); y(k) = p.getY(); z(k) = p.getZ();
                vx(k) = v.getX(); vy(k) = v.getY(); vz(k) = v.getZ();

                ecef = state.getPosition(earthFrame);
                ecefX(k) = ecef.getX(); ecefY(k) = ecef.getY(); ecefZ(k) = ecef.getZ();
                point = earth.transform(ecef, earthFrame, date);
                lat(k) = rad2deg(point.getLatitude());
                lon(k) = mod(rad2deg(point.getLongitude()) + 180.0, 360.0) - 180.0;
                alt(k) = point.getAltitude();
            end

            ephemeris = table(timeVector, x, y, z, vx, vy, vz, ...
                ecefX, ecefY, ecefZ, lat, lon, alt, ...
                'VariableNames', {'Time', 'X_m', 'Y_m', 'Z_m', ...
                'VX_mps', 'VY_mps', 'VZ_mps', ...
                'ECEF_X_m', 'ECEF_Y_m', 'ECEF_Z_m', ...
                'LatitudeDeg', 'LongitudeDeg', 'AltitudeM'});
        end
    end
end
