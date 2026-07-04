classdef OrekitFrameTransform
    %OREKITFRAMETRANSFORM Coordinate transforms between suite frames.

    methods (Static)
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
