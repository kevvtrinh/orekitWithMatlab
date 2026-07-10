function [vBody, dcmBodyFromEcef] = ecefToBodyVectors(vEcef, attitude)
%ECEFTOBODYVECTORS Rotate ECEF vectors into the satellite body frame, batched.
%
% vBody = ecefToBodyVectors(vEcef, dcmBodyFromEcef)
% [vBody, dcmBodyFromEcef] = ecefToBodyVectors(vEcef, quaternionsN4)
%
% vEcef            N-by-3 or N-by-3-by-M vectors in ECEF (e.g. look vectors
%                  to M targets at N times)
% dcmBodyFromEcef  3-by-3-by-N rotation matrices, rows = body axes in ECEF
%                  (as returned by lvlhFromEcefState)
% quaternionsN4    N-by-4 attitude quaternions [w x y z], Hamilton
%                  convention, scalar first, unit or near-unit, describing
%                  the rotation FROM ECEF TO body: vBody = R(q) * vEcef.
%
% Returns vBody with the same size as vEcef, plus the 3-by-3-by-N DCM
% stack that was applied (useful when the attitude was given as quaternions).
%
% Performance: the rotation varies per time step while the targets vary
% per page, so a naive pagemtimes would need an N-by-3-by-M to 3-by-M-by-N
% permutation (expensive at scale). Instead each body component is one
% implicit-expansion accumulation, (N-by-1) .* (N-by-1-by-M), so the peak
% temporary is a single N-by-1-by-M slab and there is no loop over time or
% targets. Memory for the result is 24*N*M bytes - about 2.1 GB for
% 86,401 steps x 1,000 targets.

arguments
    vEcef double
    attitude double
end

if size(vEcef, 2) ~= 3 || ndims(vEcef) > 3
    error("ecefToBodyVectors:InvalidVectors", ...
        "Vectors must be N-by-3 or N-by-3-by-M.");
end
n = size(vEcef, 1);

if size(attitude, 1) == 3 && size(attitude, 2) == 3
    if size(attitude, 3) ~= n
        error("ecefToBodyVectors:DcmCountMismatch", ...
            "Expected one 3-by-3 DCM per time step (3-by-3-by-%d).", n);
    end
    dcmBodyFromEcef = attitude;
elseif ismatrix(attitude) && size(attitude, 2) == 4
    if size(attitude, 1) ~= n
        error("ecefToBodyVectors:QuaternionCountMismatch", ...
            "Expected one quaternion per time step (%d-by-4).", n);
    end
    dcmBodyFromEcef = quaternionsToDcm(attitude);
else
    error("ecefToBodyVectors:InvalidAttitude", ...
        "Attitude must be 3-by-3-by-N DCMs or an N-by-4 quaternion array.");
end

% Row components of every DCM as N-by-1 columns.
dcm = dcmBodyFromEcef;
r11 = reshape(dcm(1, 1, :), n, 1); r12 = reshape(dcm(1, 2, :), n, 1); r13 = reshape(dcm(1, 3, :), n, 1);
r21 = reshape(dcm(2, 1, :), n, 1); r22 = reshape(dcm(2, 2, :), n, 1); r23 = reshape(dcm(2, 3, :), n, 1);
r31 = reshape(dcm(3, 1, :), n, 1); r32 = reshape(dcm(3, 2, :), n, 1); r33 = reshape(dcm(3, 3, :), n, 1);

vx = vEcef(:, 1, :);
vy = vEcef(:, 2, :);
vz = vEcef(:, 3, :);

vBody = zeros(size(vEcef), "like", vEcef);
vBody(:, 1, :) = r11 .* vx + r12 .* vy + r13 .* vz;
vBody(:, 2, :) = r21 .* vx + r22 .* vy + r23 .* vz;
vBody(:, 3, :) = r31 .* vx + r32 .* vy + r33 .* vz;
end

function dcm = quaternionsToDcm(q)
% Hamilton, scalar-first [w x y z], passive transformation ECEF -> body.
q = q ./ vecnorm(q, 2, 2);
w = q(:, 1); x = q(:, 2); y = q(:, 3); z = q(:, 4);

n = size(q, 1);
dcm = zeros(3, 3, n);
dcm(1, 1, :) = w.^2 + x.^2 - y.^2 - z.^2;
dcm(1, 2, :) = 2 .* (x .* y + w .* z);
dcm(1, 3, :) = 2 .* (x .* z - w .* y);
dcm(2, 1, :) = 2 .* (x .* y - w .* z);
dcm(2, 2, :) = w.^2 - x.^2 + y.^2 - z.^2;
dcm(2, 3, :) = 2 .* (y .* z + w .* x);
dcm(3, 1, :) = 2 .* (x .* z + w .* y);
dcm(3, 2, :) = 2 .* (y .* z - w .* x);
dcm(3, 3, :) = w.^2 - x.^2 - y.^2 + z.^2;
end
