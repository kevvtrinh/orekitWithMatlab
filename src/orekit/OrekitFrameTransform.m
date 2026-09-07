classdef OrekitFrameTransform
    %OREKITFRAMETRANSFORM Coordinate transforms between suite frames.

    methods (Static)
        function states = inertialStateToGcrf(timeVector, states, frameName)
            %INERTIALSTATETOGCRF Convert N-by-6 [position,velocity] to GCRF.
            % Input units are m and m/s, with one UTC datetime per row.
            % Earth-centered ICRF denotes GCRF axes; J2000 denotes EME2000.
            validateattributes(states, {'numeric'}, ...
                {'2d', 'ncols', 6, 'real', 'finite'});
            states = double(states);
            timeVector = OrekitTime.ensureUtc(timeVector(:));
            if numel(timeVector) ~= size(states, 1) || any(isnat(timeVector))
                error("OrekitFrameTransform:TimeSizeMismatch", ...
                    "Provide one finite datetime for each six-component state.");
            end
            frameName = upper(string(frameName));
            if isscalar(frameName) && any(frameName == ["GCRF", "ICRF"])
                return;
            end
            if ~isscalar(frameName) || ...
                    ~any(frameName == ["EME2000", "J2000"])
                error("OrekitFrameTransform:UnsupportedFrame", ...
                    "Expected Earth-centered GCRF, ICRF, EME2000, or J2000.");
            end
            OrekitInitializer.initialize();
            sourceFrame = OrekitFrames.outputFrame("EME2000");
            destinationFrame = OrekitFrames.outputFrame("GCRF");
            for sampleIndex = 1:size(states, 1)
                date = OrekitTime.toAbsoluteDate(timeVector(sampleIndex));
                transform = sourceFrame.getTransformTo(destinationFrame, date);
                position = javaObject( ...
                    "org.hipparchus.geometry.euclidean.threed.Vector3D", ...
                    states(sampleIndex, 1), states(sampleIndex, 2), ...
                    states(sampleIndex, 3));
                velocity = javaObject( ...
                    "org.hipparchus.geometry.euclidean.threed.Vector3D", ...
                    states(sampleIndex, 4), states(sampleIndex, 5), ...
                    states(sampleIndex, 6));
                pv = javaObject("org.orekit.utils.PVCoordinates", ...
                    position, velocity);
                transformed = transform.transformPVCoordinates(pv);
                position = transformed.getPosition();
                velocity = transformed.getVelocity();
                states(sampleIndex, :) = [position.getX(), position.getY(), ...
                    position.getZ(), velocity.getX(), velocity.getY(), ...
                    velocity.getZ()];
            end
        end

        function gcrfMeters = ecefToGcrf(time, ecefMeters)
            %ECEFTOGCRF Transform ECEF/ITRF position rows into GCRF meters.
            rotation = OrekitFrameTransform.ecefToGcrfRotation(time);
            [ecefMeters, wasVector] = OrekitFrameTransform.normalizeRows(ecefMeters);
            gcrfMeters = ecefMeters;
            valid = all(isfinite(ecefMeters), 2);
            gcrfMeters(valid, :) = ecefMeters(valid, :) * rotation.';
            if wasVector
                gcrfMeters = reshape(gcrfMeters, 1, 3);
            end
        end

        function ecefMeters = gcrfToEcef(time, gcrfMeters)
            %GCRFTOECEF Transform GCRF position rows into ECEF/ITRF meters.
            rotation = OrekitFrameTransform.ecefToGcrfRotation(time);
            [gcrfMeters, wasVector] = OrekitFrameTransform.normalizeRows(gcrfMeters);
            ecefMeters = gcrfMeters;
            valid = all(isfinite(gcrfMeters), 2);
            ecefMeters(valid, :) = gcrfMeters(valid, :) * rotation;
            if wasVector
                ecefMeters = reshape(ecefMeters, 1, 3);
            end
        end

        function rotation = ecefToGcrfRotation(time)
            %ECEFTOGCRFROTATION Direction cosine matrix from ECEF to GCRF.
            persistent cachedTime cachedRotation

            time = OrekitTime.ensureUtc(time);
            if ~isscalar(time)
                error("OrekitFrameTransform:NonScalarTime", ...
                    "Expected a scalar datetime.");
            end
            if ~isempty(cachedTime) && isequal(cachedTime, time)
                rotation = cachedRotation;
                return;
            end

            OrekitInitializer.initialize();
            earthFrame = OrekitFrames.earthFrame();
            inertialFrame = OrekitFrames.outputFrame("GCRF");
            date = OrekitTime.toAbsoluteDate(time);
            transform = earthFrame.getTransformTo(inertialFrame, date);

            rotation = zeros(3, 3);
            basis = eye(3);
            for k = 1:3
                source = javaObject( ...
                    "org.hipparchus.geometry.euclidean.threed.Vector3D", ...
                    basis(1, k), basis(2, k), basis(3, k));
                target = transform.transformPosition(source);
                rotation(:, k) = [target.getX(); target.getY(); target.getZ()];
            end

            cachedTime = time;
            cachedRotation = rotation;
        end

        function velocity = gcrfStateToEcefVelocity(time, state)
            %GCRFSTATETOECEFVELOCITY Earth-relative velocity, ECEF m/s.
            % state is [x y z vx vy vz] in GCRF meters and m/s at scalar
            % datetime time. Transforming a full PV includes frame rotation;
            % rotating the velocity vector alone is not this derivative.
            validateattributes(state, {'numeric'}, ...
                {'vector', 'numel', 6, 'real', 'finite'});
            state = reshape(double(state), 1, 6);
            time = OrekitTime.ensureUtc(time);
            if ~isscalar(time) || isnat(time)
                error("OrekitFrameTransform:NonScalarTime", ...
                    "Expected a valid scalar datetime for the GCRF state.");
            end
            OrekitInitializer.initialize();
            date = OrekitTime.toAbsoluteDate(time);
            sourceFrame = OrekitFrames.outputFrame("GCRF");
            transform = sourceFrame.getTransformTo(OrekitFrames.earthFrame(), date);
            position = javaObject( ...
                "org.hipparchus.geometry.euclidean.threed.Vector3D", ...
                state(1), state(2), state(3));
            inertialVelocity = javaObject( ...
                "org.hipparchus.geometry.euclidean.threed.Vector3D", ...
                state(4), state(5), state(6));
            pv = javaObject("org.orekit.utils.PVCoordinates", position, inertialVelocity);
            transformed = transform.transformPVCoordinates(pv);
            earthVelocity = transformed.getVelocity();
            velocity = [earthVelocity.getX(), earthVelocity.getY(), earthVelocity.getZ()];
        end
    end

    methods (Static, Access = private)
        function [rows, wasVector] = normalizeRows(values)
            values = double(values);
            wasVector = isvector(values) && numel(values) == 3;
            if wasVector
                rows = reshape(values, 1, 3);
                return;
            end
            if size(values, 2) ~= 3
                error("OrekitFrameTransform:InvalidPositionMatrix", ...
                    "Expected an N-by-3 position matrix.");
            end
            rows = values;
        end
    end
end
