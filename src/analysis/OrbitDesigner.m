classdef OrbitDesigner
    %ORBITDESIGNER Common orbit design recipes (STK Orbit Wizard style).
    %
    % All methods return ready-to-add SatelliteObject instances or plain
    % numbers. Angles in degrees, distances in meters.

    properties (Constant)
        MuEarth = 3.986004418e14
        EarthRadiusM = 6378137.0
        J2 = 1.08262668e-3
        SiderealDaySeconds = 86164.0905
        SunSyncRaanRateRadS = 1.99096871e-7
    end

    methods (Static)
        function incDeg = sunSynchronousInclination(altitudeMeters, eccentricity)
            %SUNSYNCHRONOUSINCLINATION Inclination whose J2 nodal drift
            % matches the mean Sun rate (360 deg/year).
            if nargin < 2
                eccentricity = 0;
            end
            a = OrbitDesigner.EarthRadiusM + altitudeMeters;
            raanRatePerCosI = -1.5 * OrbitDesigner.J2 * ...
                sqrt(OrbitDesigner.MuEarth) * OrbitDesigner.EarthRadiusM^2 * ...
                a^(-3.5) * (1 - eccentricity^2)^(-2);
            cosInc = OrbitDesigner.SunSyncRaanRateRadS / raanRatePerCosI;
            if abs(cosInc) > 1
                error("OrbitDesigner:NoSunSyncSolution", ...
                    "No sun-synchronous inclination exists at %.0f km altitude.", ...
                    altitudeMeters / 1000);
            end
            incDeg = acosd(cosInc);
        end

        function sat = sunSynchronous(name, altitudeMeters, ltanHours, epoch)
            %SUNSYNCHRONOUS Circular SSO satellite from altitude and LTAN.
            %
            % ltanHours is the local time of the ascending node (e.g. 10.5
            % for a 10:30 morning orbit). epoch fixes the RAAN so the node
            % actually sits at that local solar time.
            incDeg = OrbitDesigner.sunSynchronousInclination(altitudeMeters);
            sunGcrf = OrekitBodies.sunPositions(epoch, "GCRF");
            sunRaDeg = atan2d(sunGcrf.Y_m(1), sunGcrf.X_m(1));
            raanDeg = mod(sunRaDeg + (ltanHours - 12) * 15, 360);
            sat = SatelliteObject.fromKeplerian(name, ...
                OrbitDesigner.EarthRadiusM + altitudeMeters, 0.0, ...
                incDeg, raanDeg, 0, 0);
        end

        function sat = geostationary(name, longitudeDeg, epoch)
            %GEOSTATIONARY GEO satellite parked over a longitude at epoch.
            a = (OrbitDesigner.MuEarth * ...
                (OrbitDesigner.SiderealDaySeconds / (2 * pi))^2)^(1 / 3);
            % Place the satellite at the requested Earth-fixed longitude:
            % right ascension = GMST + longitude. Approximate GMST from the
            % epoch (IAU 1982-style linear model, adequate for placement).
            epoch.TimeZone = "UTC";
            jd = juliandate(epoch);
            gmstDeg = mod(280.46061837 + 360.98564736629 * (jd - 2451545.0), 360);
            % Tiny e/i avoid the circular-equatorial element singularity.
            sat = SatelliteObject.fromKeplerian(name, a, 1e-4, 0.01, 0, 0, ...
                mod(gmstDeg + longitudeDeg, 360));
        end

        function sat = molniya(name, raanDeg)
            %MOLNIYA Classic 12-hour critically inclined HEO.
            if nargin < 2
                raanDeg = 0;
            end
            period = OrbitDesigner.SiderealDaySeconds / 2;
            a = (OrbitDesigner.MuEarth * (period / (2 * pi))^2)^(1 / 3);
            sat = SatelliteObject.fromKeplerian(name, a, 0.74, 63.4, raanDeg, 270, 0);
        end

        function a = repeatGroundTrackSma(revolutions, days)
            %REPEATGROUNDTRACKSMA Semi-major axis whose track repeats after
            % `revolutions` orbits in `days` sidereal days (two-body).
            period = days * OrbitDesigner.SiderealDaySeconds / revolutions;
            a = (OrbitDesigner.MuEarth * (period / (2 * pi))^2)^(1 / 3);
        end
    end
end
