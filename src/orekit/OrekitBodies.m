classdef OrekitBodies
    %OREKITBODIES Celestial body helpers (Sun/Moon positions).

    methods (Static)
        function sun = sun()
            OrekitInitializer.initialize();
            sun = javaMethod("getSun", "org.orekit.bodies.CelestialBodyFactory");
        end

        function moon = moon()
            OrekitInitializer.initialize();
            moon = javaMethod("getMoon", "org.orekit.bodies.CelestialBodyFactory");
        end

        function positions = sunPositions(timeVector, frameName)
            %SUNPOSITIONS Sun position table over time in GCRF or ECEF (meters).
            if nargin < 2
                frameName = "GCRF";
            end
            positions = OrekitBodies.bodyPositions(OrekitBodies.sun(), timeVector, frameName);
        end

        function positions = moonPositions(timeVector, frameName)
            %MOONPOSITIONS Moon position table over time in GCRF or ECEF (meters).
            if nargin < 2
                frameName = "GCRF";
            end
            positions = OrekitBodies.bodyPositions(OrekitBodies.moon(), timeVector, frameName);
        end

        function positions = bodyPositions(body, timeVector, frameName)
            timeVector = OrekitTime.ensureUtc(timeVector(:));
            switch upper(string(frameName))
                case "ECEF"
                    frame = OrekitFrames.earthFrame();
                otherwise
                    frame = OrekitFrames.outputFrame(frameName);
            end

            n = numel(timeVector);
            x = zeros(n, 1); y = zeros(n, 1); z = zeros(n, 1);
            for k = 1:n
                date = OrekitTime.toAbsoluteDate(timeVector(k));
                p = body.getPVCoordinates(date, frame).getPosition();
                x(k) = p.getX(); y(k) = p.getY(); z(k) = p.getZ();
            end
            positions = table(timeVector, x, y, z, ...
                'VariableNames', {'Time', 'X_m', 'Y_m', 'Z_m'});
        end
    end
end
