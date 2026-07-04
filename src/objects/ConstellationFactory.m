classdef ConstellationFactory
    %CONSTELLATIONFACTORY Build groups of SatelliteObject instances.

    methods (Static)
        function satellites = walkerDelta(prefix, totalSatellites, planes, phasing, ...
                semiMajorAxisMeters, inclinationDeg, varargin)
            satellites = ConstellationFactory.walker("Delta", prefix, ...
                totalSatellites, planes, phasing, semiMajorAxisMeters, ...
                inclinationDeg, varargin{:});
        end

        function satellites = walkerStar(prefix, totalSatellites, planes, phasing, ...
                semiMajorAxisMeters, inclinationDeg, varargin)
            satellites = ConstellationFactory.walker("Star", prefix, ...
                totalSatellites, planes, phasing, semiMajorAxisMeters, ...
                inclinationDeg, varargin{:});
        end

        function satellites = walker(pattern, prefix, totalSatellites, planes, phasing, ...
                semiMajorAxisMeters, inclinationDeg, varargin)
            options = ConstellationFactory.parseOptions(varargin{:});
            pattern = ConstellationFactory.normalizePattern(pattern);
            ConstellationFactory.validateWalkerInputs(prefix, totalSatellites, ...
                planes, phasing, semiMajorAxisMeters, inclinationDeg, options);

            if pattern == "Delta"
                raanSpreadDeg = 360.0;
            else
                raanSpreadDeg = 180.0;
            end

            satellites = ConstellationFactory.buildWalkerSatellites(pattern, ...
                prefix, totalSatellites, planes, phasing, semiMajorAxisMeters, ...
                inclinationDeg, raanSpreadDeg, options);
        end

        function scenario = addToScenario(scenario, satellites)
            for k = 1:numel(satellites)
                scenario = scenario.addObject(satellites{k});
            end
        end
    end

    methods (Static, Access = private)
        function options = parseOptions(varargin)
            parser = inputParser();
            parser.FunctionName = "ConstellationFactory.walker";
            addParameter(parser, "Eccentricity", 0.0);
            addParameter(parser, "RAANOffsetDeg", 0.0);
            addParameter(parser, "ArgPerigeeDeg", 0.0);
            addParameter(parser, "TrueAnomalyOffsetDeg", 0.0);
            addParameter(parser, "MassKg", 1000.0);
            addParameter(parser, "Color", []);
            parse(parser, varargin{:});
            options = parser.Results;
        end

        function pattern = normalizePattern(pattern)
            patternText = upper(string(strtrim(pattern)));
            switch patternText
                case {"DELTA", "WALKERDELTA", "WALKER DELTA"}
                    pattern = "Delta";
                case {"STAR", "WALKERSTAR", "WALKER STAR"}
                    pattern = "Star";
                otherwise
                    error("ConstellationFactory:UnsupportedPattern", ...
                        "Unsupported constellation pattern: %s", string(pattern));
            end
        end

        function validateWalkerInputs(prefix, totalSatellites, planes, phasing, ...
                semiMajorAxisMeters, inclinationDeg, options)
            if strlength(strtrim(string(prefix))) == 0
                error("ConstellationFactory:InvalidPrefix", ...
                    "Constellation prefix cannot be empty.");
            end
            if totalSatellites <= 0 || fix(totalSatellites) ~= totalSatellites
                error("ConstellationFactory:InvalidTotalSatellites", ...
                    "Total satellite count must be a positive integer.");
            end
            if planes <= 0 || fix(planes) ~= planes
                error("ConstellationFactory:InvalidPlanes", ...
                    "Plane count must be a positive integer.");
            end
            if mod(totalSatellites, planes) ~= 0
                error("ConstellationFactory:InvalidPlaneCount", ...
                    "Total satellite count must be divisible by plane count.");
            end
            if phasing < 0 || fix(phasing) ~= phasing
                error("ConstellationFactory:InvalidPhasing", ...
                    "Walker phasing must be a nonnegative integer.");
            end
            if semiMajorAxisMeters <= 0
                error("ConstellationFactory:InvalidSemiMajorAxis", ...
                    "Semi-major axis must be positive.");
            end
            if options.Eccentricity < 0 || options.Eccentricity >= 1
                error("ConstellationFactory:InvalidEccentricity", ...
                    "Eccentricity must be in the interval [0, 1).");
            end
            if ~isfinite(inclinationDeg)
                error("ConstellationFactory:InvalidInclination", ...
                    "Inclination must be finite.");
            end
            if ~isempty(options.Color) && numel(options.Color) ~= 3
                error("ConstellationFactory:InvalidColor", ...
                    "Color must be an RGB triplet.");
            end
        end

        function satellites = buildWalkerSatellites(pattern, prefix, totalSatellites, ...
                planes, phasing, semiMajorAxisMeters, inclinationDeg, ...
                raanSpreadDeg, options)
            satellites = cell(totalSatellites, 1);
            satsPerPlane = totalSatellites / planes;
            raanSpacingDeg = raanSpreadDeg / planes;
            inPlaneSpacingDeg = 360.0 / satsPerPlane;
            phaseSpacingDeg = phasing * 360.0 / totalSatellites;
            description = sprintf("Walker %s %s:%d/%d/%d", ...
                pattern, ConstellationFactory.angleLabel(inclinationDeg), ...
                totalSatellites, planes, phasing);

            satIndex = 1;
            for planeIndex = 0:(planes - 1)
                raanDeg = ConstellationFactory.wrapDegrees( ...
                    options.RAANOffsetDeg + planeIndex * raanSpacingDeg);
                planePhaseDeg = planeIndex * phaseSpacingDeg;

                for slotIndex = 0:(satsPerPlane - 1)
                    trueAnomalyDeg = ConstellationFactory.wrapDegrees( ...
                        options.TrueAnomalyOffsetDeg + ...
                        slotIndex * inPlaneSpacingDeg + planePhaseDeg);
                    name = sprintf("%s-P%02d-S%02d", ...
                        char(prefix), planeIndex + 1, slotIndex + 1);
                    sat = SatelliteObject.fromKeplerian(name, semiMajorAxisMeters, ...
                        options.Eccentricity, inclinationDeg, raanDeg, ...
                        options.ArgPerigeeDeg, trueAnomalyDeg);
                    sat.MassKg = options.MassKg;
                    sat.Description = description;
                    if ~isempty(options.Color)
                        sat.Color = reshape(options.Color, 1, 3);
                    end
                    satellites{satIndex} = sat;
                    satIndex = satIndex + 1;
                end
            end
        end

        function label = angleLabel(value)
            label = sprintf("%.3f", value);
            label = regexprep(label, "0+$", "");
            label = regexprep(label, "\.$", "");
        end

        function angleDeg = wrapDegrees(angleDeg)
            angleDeg = mod(angleDeg, 360.0);
            if angleDeg < 0
                angleDeg = angleDeg + 360.0;
            end
        end
    end
end
