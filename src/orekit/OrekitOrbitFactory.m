classdef OrekitOrbitFactory
    %OREKITORBITFACTORY Construct Orekit orbit objects from mission objects.

    methods (Static)
        function orbit = createOrbit(satellite, config)
            switch satellite.OrbitDefinitionType
                case "Keplerian"
                    orbit = OrekitOrbitFactory.createKeplerianOrbit(satellite, config);
                case "Cartesian"
                    orbit = OrekitOrbitFactory.createCartesianOrbit(satellite, config);
                case "TLE"
                    orbit = [];
                otherwise
                    error("OrekitOrbitFactory:UnsupportedOrbitType", ...
                        "Unsupported orbit definition type: %s", satellite.OrbitDefinitionType);
            end
        end

        function orbit = createKeplerianOrbit(satellite, config)
            epoch = OrekitTime.toAbsoluteDate(config.Epoch);
            frame = OrekitFrames.outputFrame(config.OutputFrame);
            angleType = javaMethod("valueOf", "org.orekit.orbits.PositionAngleType", "TRUE");
            mu = 3.986004418e14;
            orbit = javaObject("org.orekit.orbits.KeplerianOrbit", ...
                satellite.SemiMajorAxisMeters, satellite.Eccentricity, ...
                deg2rad(satellite.InclinationDeg), deg2rad(satellite.ArgPerigeeDeg), ...
                deg2rad(satellite.RAANDeg), deg2rad(satellite.TrueAnomalyDeg), ...
                angleType, frame, epoch, mu);
        end

        function orbit = createCartesianOrbit(satellite, config)
            state = satellite.CartesianState;
            position = javaObject("org.hipparchus.geometry.euclidean.threed.Vector3D", ...
                state(1), state(2), state(3));
            velocity = javaObject("org.hipparchus.geometry.euclidean.threed.Vector3D", ...
                state(4), state(5), state(6));
            pv = javaObject("org.orekit.utils.PVCoordinates", position, velocity);
            orbit = javaObject("org.orekit.orbits.CartesianOrbit", pv, ...
                OrekitFrames.outputFrame(config.OutputFrame), ...
                OrekitTime.toAbsoluteDate(config.Epoch), 3.986004418e14);
        end
    end
end

