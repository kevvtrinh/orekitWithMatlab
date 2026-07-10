function quaternion = rotationMatrixToStkQuaternion(rotation)
%ROTATIONMATRIXTOSTKQUATERNION DCM to STK [vector, scalar] quaternion.
%
% rotation maps reference-frame components into body-frame components.
% STK's AttitudeTimeQuaternions convention places the scalar fourth.

if ~isequal(size(rotation), [3 3]) || any(~isfinite(rotation), "all")
    error("rotationMatrixToStkQuaternion:InvalidRotation", ...
        "Rotation must be a finite 3-by-3 matrix.");
end

traceValue = trace(rotation);
if traceValue > 0
    scale = 2 * sqrt(traceValue + 1);
    qw = 0.25 * scale;
    qx = (rotation(3, 2) - rotation(2, 3)) / scale;
    qy = (rotation(1, 3) - rotation(3, 1)) / scale;
    qz = (rotation(2, 1) - rotation(1, 2)) / scale;
elseif rotation(1, 1) > rotation(2, 2) && rotation(1, 1) > rotation(3, 3)
    scale = 2 * sqrt(max(1 + rotation(1, 1) - rotation(2, 2) - rotation(3, 3), 0));
    qw = (rotation(3, 2) - rotation(2, 3)) / scale;
    qx = 0.25 * scale;
    qy = (rotation(1, 2) + rotation(2, 1)) / scale;
    qz = (rotation(1, 3) + rotation(3, 1)) / scale;
elseif rotation(2, 2) > rotation(3, 3)
    scale = 2 * sqrt(max(1 + rotation(2, 2) - rotation(1, 1) - rotation(3, 3), 0));
    qw = (rotation(1, 3) - rotation(3, 1)) / scale;
    qx = (rotation(1, 2) + rotation(2, 1)) / scale;
    qy = 0.25 * scale;
    qz = (rotation(2, 3) + rotation(3, 2)) / scale;
else
    scale = 2 * sqrt(max(1 + rotation(3, 3) - rotation(1, 1) - rotation(2, 2), 0));
    qw = (rotation(2, 1) - rotation(1, 2)) / scale;
    qx = (rotation(1, 3) + rotation(3, 1)) / scale;
    qy = (rotation(2, 3) + rotation(3, 2)) / scale;
    qz = 0.25 * scale;
end

quaternion = [qx, qy, qz, qw];
magnitude = norm(quaternion);
if ~isfinite(magnitude) || magnitude < eps
    error("rotationMatrixToStkQuaternion:DegenerateRotation", ...
        "Could not construct a quaternion from the supplied rotation.");
end
quaternion = quaternion / magnitude;
end
