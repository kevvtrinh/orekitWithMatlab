classdef ManeuverPlanner
    %MANEUVERPLANNER Classical impulsive transfer sizing helpers.
    %
    % All radii are measured from Earth's center in meters and all
    % delta-V values are returned in m/s.

    properties (Constant)
        MuEarth = 3.986004418e14
    end

    methods (Static)
        function plan = hohmann(r1Meters, r2Meters)
            %HOHMANN Two-burn coplanar circular-to-circular transfer.
            mu = ManeuverPlanner.MuEarth;
            v1 = sqrt(mu / r1Meters);
            v2 = sqrt(mu / r2Meters);
            aTransfer = (r1Meters + r2Meters) / 2;
            vTransfer1 = sqrt(mu * (2 / r1Meters - 1 / aTransfer));
            vTransfer2 = sqrt(mu * (2 / r2Meters - 1 / aTransfer));

            plan = struct();
            plan.DV1mps = vTransfer1 - v1;
            plan.DV2mps = v2 - vTransfer2;
            plan.TotalDVmps = abs(plan.DV1mps) + abs(plan.DV2mps);
            plan.TransferTimeSeconds = pi * sqrt(aTransfer^3 / mu);
            plan.TransferSemiMajorAxisMeters = aTransfer;
        end

        function dvMps = planeChange(speedMps, deltaInclinationDeg)
            %PLANECHANGE Delta-V for a pure inclination change at given speed.
            dvMps = 2 * speedMps * sin(deg2rad(deltaInclinationDeg) / 2);
        end

        function maneuvers = hohmannManeuvers(startTime, r1Meters, r2Meters, namePrefix)
            %HOHMANNMANEUVERS Build the two ImpulsiveManeuver objects for a
            % Hohmann transfer starting at startTime. Burns are along-track
            % (TNW) and assume the satellite is on a circular orbit of
            % radius r1 at startTime.
            if nargin < 4
                namePrefix = "Hohmann";
            end
            plan = ManeuverPlanner.hohmann(r1Meters, r2Meters);
            burn1 = ImpulsiveManeuver(namePrefix + "-1", startTime, "TNW", ...
                [plan.DV1mps 0 0]);
            burn2 = ImpulsiveManeuver(namePrefix + "-2", ...
                startTime + seconds(plan.TransferTimeSeconds), "TNW", ...
                [plan.DV2mps 0 0]);
            maneuvers = {burn1, burn2};
        end
    end
end
