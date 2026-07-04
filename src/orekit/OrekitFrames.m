classdef OrekitFrames
    %OREKITFRAMES Frame and Earth model helpers.

    methods (Static)
        function frame = outputFrame(name)
            switch upper(string(name))
                case "GCRF"
                    frame = javaMethod("getGCRF", "org.orekit.frames.FramesFactory");
                case "EME2000"
                    frame = javaMethod("getEME2000", "org.orekit.frames.FramesFactory");
                otherwise
                    error("OrekitFrames:UnsupportedFrame", ...
                        "Unsupported output frame: %s", string(name));
            end
        end

        function frame = earthFrame()
            conventions = javaMethod("valueOf", "org.orekit.utils.IERSConventions", "IERS_2010");
            frame = javaMethod("getITRF", "org.orekit.frames.FramesFactory", conventions, true);
        end

        function earth = earthShape()
            earth = javaObject("org.orekit.bodies.OneAxisEllipsoid", ...
                6378137.0, 1.0 / 298.257223563, OrekitFrames.earthFrame());
        end

        function frame = topocentricFrame(groundStation)
            point = javaObject("org.orekit.bodies.GeodeticPoint", ...
                deg2rad(groundStation.LatitudeDeg), deg2rad(groundStation.LongitudeDeg), ...
                groundStation.AltitudeMeters);
            frame = javaObject("org.orekit.frames.TopocentricFrame", ...
                OrekitFrames.earthShape(), point, char(groundStation.Name));
        end

        function [x, y, z] = geodeticToECEF(latDeg, lonDeg, altitudeMeters)
            a = 6378137.0;
            f = 1.0 / 298.257223563;
            e2 = f * (2.0 - f);
            lat = deg2rad(latDeg);
            lon = deg2rad(lonDeg);
            n = a / sqrt(1.0 - e2 * sin(lat)^2);
            x = (n + altitudeMeters) * cos(lat) * cos(lon);
            y = (n + altitudeMeters) * cos(lat) * sin(lon);
            z = (n * (1.0 - e2) + altitudeMeters) * sin(lat);
        end
    end
end

