function study = createOhioScenario()
%% Section 0: Header & Readme
% SYNTAX
%   study = createOhioScenario()
%**************************************************************************
% PURPOSE
%   - Create one scenario containing a satellite and an Ohio point target.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - study (scenario.Scenario)
%       Scenario containing one Satellite and one PointTarget.
%**************************************************************************
% UNITS
%   - Satellite position is metres in GCRF and velocity is metres per second.
%   - Target coordinates are WGS84 geodetic degrees and ellipsoidal metres.
%**************************************************************************

%% Section 1: Create The Scenario

startTime = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
stopTime = startTime + hours(1);
study = scenario.Scenario("Ohio Demonstration", startTime, stopTime);

%% Section 2: Add The Satellite

ohioGeodetic_lla = [40, -83, 250];
satelliteGeodetic_lla = [40, -83, 621863];
satellitePosition_m = ...
    scenario.frames.convertGeodeticToEarthFixed(satelliteGeodetic_lla);
longitude_rad = deg2rad(satelliteGeodetic_lla(2));
eastUnitVector = [-sin(longitude_rad), cos(longitude_rad), 0];
initialState = struct( ...
    "epoch", startTime, ...
    "frame", "ITRF", ...
    "position_m", satellitePosition_m, ...
    "velocity_m_s", 7546 * eastUnitVector);
study.addSatellite("LEO-1", initialState);

%% Section 3: Add The Ohio Target

% This representative WGS84 coordinate lies in central Ohio. It is deliberately
% not tied to a catalog so this first example has no geodata dependency.
study.addPlace( ...
    "Ohio Place", ...
    ohioGeodetic_lla(1), ...
    ohioGeodetic_lla(2), ...
    ohioGeodetic_lla(3));
end
