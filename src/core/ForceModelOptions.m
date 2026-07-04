classdef ForceModelOptions
    %FORCEMODELOPTIONS Force model settings for numerical (HPOP-style) propagation.
    %
    % Defaults give an STK HPOP-like LEO setup: 8x8 gravity, sun/moon
    % third-body, solar radiation pressure, and Harris-Priester drag.
    % Drag and SRP spacecraft parameters live on SatelliteObject.

    properties
        GravityDegree double = 8
        GravityOrder double = 8
        IncludeSunGravity logical = true
        IncludeMoonGravity logical = true
        IncludeDrag logical = true
        IncludeSRP logical = true
        MinStepSeconds double = 1e-3
        MaxStepSeconds double = 300
        AbsTolerance double = 1e-3
        RelTolerance double = 1e-9
    end

    methods
        function obj = ForceModelOptions(varargin)
            if mod(nargin, 2) ~= 0
                error("ForceModelOptions:InvalidInputs", ...
                    "Use name-value pairs when constructing ForceModelOptions.");
            end
            for k = 1:2:nargin
                name = varargin{k};
                if ~isprop(obj, name)
                    error("ForceModelOptions:UnknownProperty", ...
                        "Unknown ForceModelOptions property: %s", string(name));
                end
                obj.(name) = varargin{k + 1};
            end
        end

        function validate(obj)
            if ~(obj.GravityDegree == 0 || obj.GravityDegree >= 2) || obj.GravityOrder < 0
                error("ForceModelOptions:InvalidGravityField", ...
                    "Gravity degree must be 0 (point mass) or >= 2.");
            end
            if obj.GravityOrder > obj.GravityDegree
                error("ForceModelOptions:InvalidGravityField", ...
                    "Gravity order cannot exceed gravity degree.");
            end
            if obj.MinStepSeconds <= 0 || obj.MaxStepSeconds <= obj.MinStepSeconds
                error("ForceModelOptions:InvalidStepBounds", ...
                    "Integrator step bounds must satisfy 0 < MinStep < MaxStep.");
            end
        end

        function data = toStruct(obj)
            data = struct();
            props = properties(obj);
            for k = 1:numel(props)
                data.(props{k}) = obj.(props{k});
            end
        end
    end

    methods (Static)
        function obj = fromStruct(data)
            obj = ForceModelOptions();
            names = fieldnames(data);
            for k = 1:numel(names)
                if isprop(obj, names{k})
                    obj.(names{k}) = data.(names{k});
                end
            end
        end

        function obj = twoBody()
            %TWOBODY Numerical propagation with point-mass central gravity only.
            obj = ForceModelOptions("GravityDegree", 0, "GravityOrder", 0, ...
                "IncludeSunGravity", false, "IncludeMoonGravity", false, ...
                "IncludeDrag", false, "IncludeSRP", false);
        end
    end
end
