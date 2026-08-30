classdef Scenario < handle
    %SCENARIO Analysis interval and object composition root.
    %
    % Construction:
    %   study = scenario.Scenario(name, startTime, stopTime)
    %
    % Scenario owns its object collections and mutable composition lifecycle. Times
    % are scalar MATLAB datetimes. Added objects remain engine-neutral.

    properties (SetAccess = private)
        Name
        StartTime
        StopTime
        Satellites
        Targets
        Places
    end

    methods
        function study = Scenario(name, startTime, stopTime)
            % Create a named scenario over a strictly increasing time interval.

            name = string(name);
            isValidName = isscalar(name) && ~ismissing(name) && strlength(name) > 0;
            if ~isValidName
                error("Scenario:InvalidName", ...
                    "Scenario name must be nonempty scalar text.");
            end

            if ~(isdatetime(startTime) && isscalar(startTime))
                error("Scenario:InvalidStartTime", ...
                    "startTime must be a scalar MATLAB datetime.");
            end
            if ~(isdatetime(stopTime) && isscalar(stopTime))
                error("Scenario:InvalidStopTime", ...
                    "stopTime must be a scalar MATLAB datetime.");
            end
            hasStartTimeZone = strlength(string(startTime.TimeZone)) > 0;
            hasStopTimeZone = strlength(string(stopTime.TimeZone)) > 0;
            if ~(hasStartTimeZone && hasStopTimeZone)
                error("Scenario:MissingTimeZone", ...
                    "startTime and stopTime must declare explicit time zones.");
            end
            if stopTime <= startTime
                error("Scenario:InvalidTimeInterval", ...
                    "stopTime must occur strictly after startTime.");
            end

            study.Name = name;
            study.StartTime = startTime;
            study.StopTime = stopTime;
            study.Satellites = cell(0, 1);
            study.Targets = cell(0, 1);
            study.Places = cell(0, 1);
        end

        function satellite = addSatellite(study, name, initialState)
            % Create and add one uniquely named Satellite to this scenario.

            study.validateUniqueName(name);
            satellite = scenario.platform.Satellite(name, initialState);
            study.Satellites{end + 1, 1} = satellite;
        end

        function target = addTarget( ...
                study, name, latitude_deg, longitude_deg, altitude_m)
            % Create and add one uniquely named WGS84 PointTarget to this scenario.

            study.validateUniqueName(name);
            target = scenario.target.PointTarget( ...
                name, latitude_deg, longitude_deg, altitude_m);
            study.Targets{end + 1, 1} = target;
        end

        function place = addPlace( ...
                study, name, latitude_deg, longitude_deg, altitude_m)
            % Create and add one uniquely named WGS84 Place to this scenario.

            study.validateUniqueName(name);
            place = scenario.target.Place( ...
                name, latitude_deg, longitude_deg, altitude_m);
            study.Places{end + 1, 1} = place;
        end
    end

    methods (Access = private)
        function validateUniqueName(study, proposedName)
            % Protect the invariant that every scenario object has a unique name.

            proposedName = string(proposedName);
            existingNames = strings(0, 1);

            for satelliteIndex = 1:numel(study.Satellites)
                existingNames(end + 1, 1) = ...
                    study.Satellites{satelliteIndex}.Name; %#ok<AGROW>
            end
            for targetIndex = 1:numel(study.Targets)
                existingNames(end + 1, 1) = ...
                    study.Targets{targetIndex}.Name; %#ok<AGROW>
            end
            for placeIndex = 1:numel(study.Places)
                existingNames(end + 1, 1) = ...
                    study.Places{placeIndex}.Name; %#ok<AGROW>
            end

            if any(existingNames == proposedName)
                error("Scenario:DuplicateObjectName", ...
                    "Scenario object name '%s' is already in use.", proposedName);
            end
        end
    end
end
