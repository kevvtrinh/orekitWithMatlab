classdef Satellite
    %SATELLITE Engine-neutral satellite definition and initial state.
    %
    % Construction:
    %   satellite = scenario.platform.Satellite(name, initialState)
    %
    % The value object owns no propagator and has no mutable lifecycle. The
    % initial state uses metres, metres per second, an explicit datetime epoch,
    % and an explicit reference-frame identifier.

    properties (SetAccess = private)
        Name
        InitialState
    end

    methods
        function satellite = Satellite(name, initialState)
            % Create a satellite from a name and Cartesian initial state.
            % Invalid names, states, units, epochs, or frames produce identified
            % errors. No coordinate or unit conversion is performed.

            name = scenario.platform.Satellite.validateName(name);
            initialState = ...
                scenario.platform.Satellite.validateInitialState(initialState);

            satellite.Name = name;
            satellite.InitialState = initialState;
        end
    end

    methods (Static, Access = private)
        function name = validateName(name)
            % Normalize and validate the public satellite name.

            name = string(name);
            isValidName = isscalar(name) && ~ismissing(name) && strlength(name) > 0;
            if ~isValidName
                error("Satellite:InvalidName", ...
                    "Satellite name must be nonempty scalar text.");
            end
        end

        function initialState = validateInitialState(initialState)
            % Validate and normalize the Cartesian state boundary.

            if ~(isstruct(initialState) && isscalar(initialState))
                error("Satellite:InvalidInitialState", ...
                    "initialState must be a scalar structure.");
            end

            requiredFields = ["epoch", "frame", "position_m", "velocity_m_s"];
            actualFields = string(fieldnames(initialState));
            missingFields = requiredFields(~ismember(requiredFields, actualFields));
            if ~isempty(missingFields)
                error("Satellite:MissingInitialStateField", ...
                    "initialState is missing required field(s): %s.", ...
                    strjoin(missingFields, ", "));
            end

            if ~(isdatetime(initialState.epoch) && isscalar(initialState.epoch))
                error("Satellite:InvalidEpoch", ...
                    "initialState.epoch must be a scalar MATLAB datetime.");
            end
            if strlength(string(initialState.epoch.TimeZone)) == 0
                error("Satellite:MissingTimeZone", ...
                    "initialState.epoch must declare an explicit time zone.");
            end

            frame = string(initialState.frame);
            isValidFrame = isscalar(frame) && ~ismissing(frame) && ...
                strlength(frame) > 0;
            if ~isValidFrame
                error("Satellite:InvalidFrame", ...
                    "initialState.frame must be a nonempty scalar frame name.");
            end

            validateattributes(initialState.position_m, {'numeric'}, ...
                {'real', 'finite', 'vector', 'numel', 3}, ...
                "Satellite", "initialState.position_m");
            validateattributes(initialState.velocity_m_s, {'numeric'}, ...
                {'real', 'finite', 'vector', 'numel', 3}, ...
                "Satellite", "initialState.velocity_m_s");

            initialState.frame = frame;
            initialState.position_m = reshape(initialState.position_m, 1, 3);
            initialState.velocity_m_s = reshape(initialState.velocity_m_s, 1, 3);
        end
    end
end
