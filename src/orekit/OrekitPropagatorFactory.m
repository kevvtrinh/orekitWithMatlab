classdef OrekitPropagatorFactory
    %OREKITPROPAGATORFACTORY Construct and run Orekit propagators.
    %
    % Supported SatelliteObject.PropagatorType values:
    %   "Keplerian"        Two-body analytical propagation (default).
    %   "TLE"              SGP4/SDP4 from two-line elements.
    %   "EcksteinHechler"  Analytical zonal-harmonics (J2..J6) propagation.
    %                      Best for near-circular orbits (e < 0.1).
    %   "Numerical"/"HPOP" Numerical integration with configurable force
    %                      models (gravity field, sun/moon, drag, SRP)
    %                      taken from SatelliteObject.ForceModel.

    methods (Static)
        function propagator = createPropagator(satellite, config)
            OrekitInitializer.initialize();
            propagatorType = upper(string(satellite.PropagatorType));

            if strcmp(satellite.OrbitDefinitionType, "TLE")
                tle = javaObject("org.orekit.propagation.analytical.tle.TLE", ...
                    char(satellite.TLELine1), char(satellite.TLELine2));
                propagator = javaMethod("selectExtrapolator", ...
                    "org.orekit.propagation.analytical.tle.TLEPropagator", tle);
                if ismember(propagatorType, ["NUMERICAL", "HPOP"])
                    % Seed the numerical propagator from the SGP4 state at epoch.
                    orbit = OrekitPropagatorFactory.orbitFromPropagatorState( ...
                        propagator, config.Epoch);
                    propagator = OrekitPropagatorFactory.createPropagatorFromOrbit( ...
                        orbit, satellite);
                end
                return;
            end

            orbit = OrekitOrbitFactory.createOrbit(satellite, config);
            propagator = OrekitPropagatorFactory.createPropagatorFromOrbit(orbit, satellite);
        end

        function propagator = createPropagatorFromOrbit(orbit, satellite)
            OrekitInitializer.initialize();
            switch upper(string(satellite.PropagatorType))
                case {"KEPLERIAN", "TWOBODY", "TLE"}
                    % "TLE" lands here only for maneuver continuation segments.
                    propagator = javaObject( ...
                        "org.orekit.propagation.analytical.KeplerianPropagator", orbit);
                case {"ECKSTEINHECHLER", "J2"}
                    provider = javaMethod("getUnnormalizedProvider", ...
                        "org.orekit.forces.gravity.potential.GravityFieldFactory", ...
                        int32(6), int32(0));
                    propagator = javaObject( ...
                        "org.orekit.propagation.analytical.EcksteinHechlerPropagator", ...
                        orbit, provider);
                case {"NUMERICAL", "HPOP"}
                    propagator = OrekitPropagatorFactory.createNumericalPropagator( ...
                        orbit, satellite);
                otherwise
                    error("OrekitPropagatorFactory:UnsupportedPropagatorType", ...
                        "Unsupported propagator type: %s", satellite.PropagatorType);
            end
        end

        function propagator = createNumericalPropagator(orbit, satellite)
            forceModel = satellite.ForceModel;
            if isstruct(forceModel)
                forceModel = ForceModelOptions.fromStruct(forceModel);
            end
            forceModel.validate();

            integrator = javaObject( ...
                "org.hipparchus.ode.nonstiff.DormandPrince853Integrator", ...
                forceModel.MinStepSeconds, forceModel.MaxStepSeconds, ...
                forceModel.AbsTolerance, forceModel.RelTolerance);
            propagator = javaObject( ...
                "org.orekit.propagation.numerical.NumericalPropagator", integrator);
            propagator.setOrbitType(javaMethod("valueOf", ...
                "org.orekit.orbits.OrbitType", "CARTESIAN"));

            if forceModel.GravityDegree >= 2
                provider = javaMethod("getNormalizedProvider", ...
                    "org.orekit.forces.gravity.potential.GravityFieldFactory", ...
                    int32(forceModel.GravityDegree), int32(forceModel.GravityOrder));
                propagator.addForceModel(javaObject( ...
                    "org.orekit.forces.gravity.HolmesFeatherstoneAttractionModel", ...
                    OrekitFrames.earthFrame(), provider));
            end
            if forceModel.IncludeSunGravity
                propagator.addForceModel(javaObject( ...
                    "org.orekit.forces.gravity.ThirdBodyAttraction", OrekitBodies.sun()));
            end
            if forceModel.IncludeMoonGravity
                propagator.addForceModel(javaObject( ...
                    "org.orekit.forces.gravity.ThirdBodyAttraction", OrekitBodies.moon()));
            end
            if forceModel.IncludeDrag
                atmosphere = javaObject( ...
                    "org.orekit.models.earth.atmosphere.HarrisPriester", ...
                    OrekitBodies.sun(), OrekitFrames.earthShape());
                propagator.addForceModel(javaObject("org.orekit.forces.drag.DragForce", ...
                    atmosphere, javaObject("org.orekit.forces.drag.IsotropicDrag", ...
                    satellite.DragAreaM2, satellite.DragCoefficient)));
            end
            if forceModel.IncludeSRP
                propagator.addForceModel(javaObject( ...
                    "org.orekit.forces.radiation.SolarRadiationPressure", ...
                    OrekitBodies.sun(), OrekitFrames.earthShape(), ...
                    javaObject("org.orekit.forces.radiation.IsotropicRadiationSingleCoefficient", ...
                    satellite.SRPAreaM2, satellite.ReflectivityCoefficient)));
            end

            state = javaObject("org.orekit.propagation.SpacecraftState", orbit);
            try
                state = state.withMass(satellite.MassKg);
            catch
                state = javaObject("org.orekit.propagation.SpacecraftState", ...
                    orbit, satellite.MassKg);
            end
            propagator.setInitialState(state);
        end

        function ephemeris = propagate(propagator, timeVector)
            timeVector = OrekitTime.ensureUtc(timeVector(:));
            n = numel(timeVector);
            x = zeros(n, 1); y = zeros(n, 1); z = zeros(n, 1);
            vx = zeros(n, 1); vy = zeros(n, 1); vz = zeros(n, 1);
            ecefX = zeros(n, 1); ecefY = zeros(n, 1); ecefZ = zeros(n, 1);
            lat = zeros(n, 1); lon = zeros(n, 1); alt = zeros(n, 1);

            inertialFrame = OrekitFrames.outputFrame("GCRF");
            earthFrame = OrekitFrames.earthFrame();
            earth = OrekitFrames.earthShape();

            for k = 1:n
                date = OrekitTime.toAbsoluteDate(timeVector(k));
                state = propagator.propagate(date);
                pv = state.getPVCoordinates(inertialFrame);
                p = pv.getPosition();
                v = pv.getVelocity();
                x(k) = p.getX(); y(k) = p.getY(); z(k) = p.getZ();
                vx(k) = v.getX(); vy(k) = v.getY(); vz(k) = v.getZ();

                ecef = state.getPosition(earthFrame);
                ecefX(k) = ecef.getX(); ecefY(k) = ecef.getY(); ecefZ(k) = ecef.getZ();
                point = earth.transform(ecef, earthFrame, date);
                lat(k) = rad2deg(point.getLatitude());
                lon(k) = mod(rad2deg(point.getLongitude()) + 180.0, 360.0) - 180.0;
                alt(k) = point.getAltitude();
            end

            ephemeris = table(timeVector, x, y, z, vx, vy, vz, ...
                ecefX, ecefY, ecefZ, lat, lon, alt, ...
                'VariableNames', {'Time', 'X_m', 'Y_m', 'Z_m', ...
                'VX_mps', 'VY_mps', 'VZ_mps', ...
                'ECEF_X_m', 'ECEF_Y_m', 'ECEF_Z_m', ...
                'LatitudeDeg', 'LongitudeDeg', 'AltitudeM'});
        end

        function [ephemeris, propagator] = propagateWithManeuvers(satellite, config, timeVector)
            %PROPAGATEWITHMANEUVERS Piecewise propagation across impulsive burns.
            %
            % At each maneuver time the current state is retrieved, the
            % delta-V applied, and a fresh propagator of the same type is
            % started from the post-burn state.
            timeVector = OrekitTime.ensureUtc(timeVector(:));
            maneuvers = OrekitPropagatorFactory.sortedManeuvers(satellite);
            propagator = OrekitPropagatorFactory.createPropagator(satellite, config);

            if isempty(maneuvers)
                ephemeris = OrekitPropagatorFactory.propagate(propagator, timeVector);
                return;
            end
            if strcmp(satellite.OrbitDefinitionType, "TLE") && ...
                    strcmpi(satellite.PropagatorType, "TLE")
                error("OrekitPropagatorFactory:ManeuversUnsupportedForTLE", ...
                    "Satellite '%s' uses SGP4; set PropagatorType to ""Numerical"" to maneuver a TLE-defined satellite.", ...
                    satellite.Name);
            end

            inertialFrame = OrekitFrames.outputFrame("GCRF");
            mu = 3.986004418e14;
            parts = {};
            remaining = timeVector;

            for m = 1:numel(maneuvers)
                maneuver = maneuvers{m};
                burnTime = OrekitTime.ensureUtc(maneuver.Time);
                if burnTime > timeVector(end)
                    continue;
                end

                preMask = remaining < burnTime;
                if any(preMask)
                    parts{end + 1} = OrekitPropagatorFactory.propagate( ...
                        propagator, remaining(preMask)); %#ok<AGROW>
                end
                remaining = remaining(~preMask);

                date = OrekitTime.toAbsoluteDate(burnTime);
                pv = propagator.propagate(date).getPVCoordinates(inertialFrame);
                p = pv.getPosition();
                v = pv.getVelocity();
                r = [p.getX(), p.getY(), p.getZ()];
                vel = [v.getX(), v.getY(), v.getZ()];
                newVel = vel + OrekitPropagatorFactory.inertialDeltaV(maneuver, r, vel);

                newOrbit = javaObject("org.orekit.orbits.CartesianOrbit", ...
                    javaObject("org.orekit.utils.PVCoordinates", ...
                    javaObject("org.hipparchus.geometry.euclidean.threed.Vector3D", ...
                    r(1), r(2), r(3)), ...
                    javaObject("org.hipparchus.geometry.euclidean.threed.Vector3D", ...
                    newVel(1), newVel(2), newVel(3))), ...
                    inertialFrame, date, mu);
                propagator = OrekitPropagatorFactory.createPropagatorFromOrbit( ...
                    newOrbit, satellite);
            end

            if ~isempty(remaining)
                parts{end + 1} = OrekitPropagatorFactory.propagate(propagator, remaining);
            end
            ephemeris = vertcat(parts{:});
        end

        function deltaV = inertialDeltaV(maneuver, positionM, velocityMps)
            %INERTIALDELTAV Resolve a maneuver delta-V into the inertial frame.
            dv = reshape(maneuver.DeltaVmps, 1, 3);
            switch upper(string(maneuver.Frame))
                case "INERTIAL"
                    deltaV = dv;
                case "TNW"
                    t = velocityMps / norm(velocityMps);
                    w = cross(positionM, velocityMps);
                    w = w / norm(w);
                    n = cross(w, t);
                    deltaV = dv(1) * t + dv(2) * n + dv(3) * w;
                otherwise
                    error("OrekitPropagatorFactory:InvalidManeuverFrame", ...
                        "Unsupported maneuver frame: %s", maneuver.Frame);
            end
        end
    end

    methods (Static, Access = private)
        function orbit = orbitFromPropagatorState(propagator, epoch)
            inertialFrame = OrekitFrames.outputFrame("GCRF");
            date = OrekitTime.toAbsoluteDate(epoch);
            pv = propagator.propagate(date).getPVCoordinates(inertialFrame);
            orbit = javaObject("org.orekit.orbits.CartesianOrbit", ...
                javaObject("org.orekit.utils.PVCoordinates", ...
                pv.getPosition(), pv.getVelocity()), ...
                inertialFrame, date, 3.986004418e14);
        end

        function maneuvers = sortedManeuvers(satellite)
            maneuvers = {};
            if ~isprop(satellite, "Maneuvers") || isempty(satellite.Maneuvers)
                return;
            end
            maneuvers = satellite.Maneuvers;
            times = NaT(numel(maneuvers), 1, "TimeZone", "UTC");
            for k = 1:numel(maneuvers)
                if isstruct(maneuvers{k})
                    maneuvers{k} = ImpulsiveManeuver.fromStruct(maneuvers{k});
                end
                maneuvers{k}.validate();
                times(k) = OrekitTime.ensureUtc(maneuvers{k}.Time);
            end
            [~, order] = sort(times);
            maneuvers = maneuvers(order);
        end
    end
end
