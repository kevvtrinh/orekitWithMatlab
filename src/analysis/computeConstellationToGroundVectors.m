function results = computeConstellationToGroundVectors(satellites, groundPoints, config, options)
%COMPUTECONSTELLATIONTOGROUNDVECTORS Look vectors for many satellites, sharing propagation.
%
% results = computeConstellationToGroundVectors({sat1, sat2, ...}, groundPoints, cfg)
%
% Satellites that fly the SAME orbital plane and ellipse (equal semi-major
% axis, eccentricity, inclination, RAAN and argument of perigee, differing
% only in anomaly) are the same two-body trajectory traversed with a time
% offset: in the INERTIAL frame r_B(t) = r_A(t + dt) exactly, with
% dt = (M_B - M_A)/n. This function propagates ONE reference satellite per
% plane (GCRF nodes over a window extended by the largest phase offset,
% wrapped to +/- half a period via two-body periodicity) and derives every
% sibling from the shared Hermite interpolant.
%
% The Earth-fixed conversion deliberately does NOT assume uniform Earth
% spin (a constant-rate z-rotation leaves meters of error over quarter-
% period offsets - precession/nutation/UT1 drift): instead the exact
% GCRF->ITRF rotation is fetched from Orekit at coarse nodes (default
% every 600 s; its deviation from uniform rotation over that span is
% sub-centimeter), converted to quaternions, and slerped onto the fine
% grid once, shared by every satellite:
%
%   r_ecef(t) = R(t) * r_gcrf(t + dt)
%   v_ecef(t) = R(t) * v_gcrf(t + dt) + omegaR(t) x r_ecef(t)
%
% where omegaR is the angular rate of the GCRF->ITRF map itself (about
% -omega_earth * zhat, i.e. this is the usual "minus omega cross r"),
% derived numerically from the rotation nodes themselves - no assumed
% Earth-rate constant anywhere.
%
% Every satellite - reference included - is spot-checked against its OWN
% exact Orekit propagator (position AND velocity) at interpolation-node
% midpoints, so a convention error, a wrap error, or satellites that only
% look co-planar are caught at runtime, not discovered downstream.
%
% Satellites that do not qualify for sharing (non-Keplerian orbit
% definition or propagator, carrying maneuvers, no co-planar sibling, or
% a scenario too short to interpolate) fall back to an individual
% computeSatToGroundVectors call - correctness never depends on grouping.
%
% groundPoints and config are as in computeSatToGroundVectors.
%
% Name-value options:
%   NodeStepSeconds          Orbit node spacing (default 60).
%   RotationStepSeconds      GCRF->ITRF rotation node spacing (default 600).
%   SpotCheckPoints          Exact-propagation checks per satellite
%                            (default 12; 0 disables).
%   SpotCheckToleranceMeters Warn above this position deviation (default 1.0).
%   ComputeAER, UseGPU, BodyFrame, AttitudeMode, JarRoot, DataRoot
%                            Forwarded to the per-satellite result
%                            assembly (see computeSatToGroundVectors).
%
% Returns:
%   results.Names       S-by-1 satellite names
%   results.Satellites  S-by-1 cell; each element is a full
%                       computeSatToGroundVectors result for that
%                       satellite (Time, SatEcefMeters, LookEcefMeters,
%                       RangeMeters, ... plus sharing details in Info)
%   results.Info        Groups, per-satellite mode/offset/spot-check
%                       errors, Orekit sample counts, timings.

arguments
    satellites cell
    groundPoints
    config ScenarioConfig
    options.NodeStepSeconds (1, 1) double {mustBePositive} = 60
    options.RotationStepSeconds (1, 1) double {mustBePositive} = 600
    options.SpotCheckPoints (1, 1) double {mustBeNonnegative} = 12
    options.SpotCheckToleranceMeters (1, 1) double {mustBePositive} = 1.0
    options.ComputeAER (1, 1) logical = true
    options.UseGPU (1, 1) logical = false
    options.BodyFrame (1, 1) logical = false
    options.AttitudeMode (1, 1) string = "LVLH_CCSDS"
    options.JarRoot string = ""
    options.DataRoot string = ""
end

totalTimer = tic;
numSats = numel(satellites);
if numSats == 0
    error("computeConstellationToGroundVectors:NoSatellites", ...
        "Provide a non-empty cell array of SatelliteObject instances.");
end
for k = 1:numSats
    if ~isa(satellites{k}, "SatelliteObject")
        error("computeConstellationToGroundVectors:InvalidSatellite", ...
            "satellites{%d} is not a SatelliteObject.", k);
    end
end
config.validate();

if strlength(string(options.JarRoot)) == 0
    OrekitInitializer.initialize();
else
    OrekitInitializer.initialize(char(options.JarRoot), char(options.DataRoot));
end

timeVector = config.getTimeVector();
epoch = timeVector(1);
offsetsSeconds = seconds(timeVector - epoch);
span = offsetsSeconds(end) - offsetsSeconds(1);
fineStep = span / max(numel(offsetsSeconds) - 1, 1);

% Sharing needs interpolation to be worthwhile at all; a scenario too
% short/coarse for interpolation routes everyone through the fallback.
nodeStep = min(options.NodeStepSeconds, span / 8);
canInterpolate = span > 0 && numel(offsetsSeconds) >= 240 && nodeStep > fineStep * 4;

names = strings(numSats, 1);
for k = 1:numSats
    names(k) = string(satellites{k}.Name);
end

% --- Group satellites by shared plane + ellipse ---------------------------
shareable = false(numSats, 1);
elements = nan(numSats, 6);   % [a e i raan argp trueAnom]
for k = 1:numSats
    sat = satellites{k};
    isKeplerianOrbit = strcmp(sat.OrbitDefinitionType, "Keplerian");
    isTwoBody = ismember(upper(string(sat.PropagatorType)), ["KEPLERIAN", "TWOBODY"]);
    shareable(k) = canInterpolate && isKeplerianOrbit && isTwoBody && isempty(sat.Maneuvers);
    if isKeplerianOrbit
        elements(k, :) = [sat.SemiMajorAxisMeters, sat.Eccentricity, ...
            sat.InclinationDeg, sat.RAANDeg, sat.ArgPerigeeDeg, sat.TrueAnomalyDeg];
    end
end

tolerance = [0.5, 1e-9, 1e-9, 1e-9, 1e-9];   % a[m], e, i/raan/argp [deg]
groupId = zeros(numSats, 1);
nextGroup = 0;
for k = 1:numSats
    if ~shareable(k) || groupId(k) > 0
        continue;
    end
    nextGroup = nextGroup + 1;
    groupId(k) = nextGroup;
    for j = k + 1:numSats
        if shareable(j) && groupId(j) == 0 && ...
                all(abs(elements(j, 1:5) - elements(k, 1:5)) <= tolerance)
            groupId(j) = nextGroup;
        end
    end
end
for g = 1:nextGroup
    if nnz(groupId == g) < 2
        groupId(groupId == g) = 0;   % singleton: no sharing benefit
    end
end

results = struct();
results.Names = names;
results.Satellites = cell(numSats, 1);

info = struct();
info.SatelliteMode = strings(numSats, 1);
info.DeltaTSeconds = zeros(numSats, 1);
info.SpotCheckMaxErrorMeters = nan(numSats, 1);
info.SpotCheckMaxVelErrorMps = nan(numSats, 1);
info.ReferenceName = strings(numSats, 1);
info.NumOrekitSamples = 0;

forwarded = {"ComputeAER", options.ComputeAER, "UseGPU", options.UseGPU, ...
    "BodyFrame", options.BodyFrame, "AttitudeMode", options.AttitudeMode};

propagationTimer = tic;
groupSummaries = struct("ReferenceName", {}, "MemberNames", {}, ...
    "DeltaTSeconds", {}, "NodeCount", {});

if any(groupId > 0)
    gcrfFrame = OrekitFrames.outputFrame("GCRF");
    earthFrame = OrekitFrames.earthFrame();
    epochDate = OrekitTime.toAbsoluteDate(epoch);
    mu = OrekitConstants.WGS84EarthMu;

    % GCRF->ITRF rotation history, shared by every satellite: exact Orekit
    % rotation matrices at coarse nodes (measured via basis vectors, so no
    % quaternion-convention guessing), slerped onto the fine grid once.
    rotationStep = min(options.RotationStepSeconds, max(span / 4, eps));
    rotationNodeTimes = unique([(0:rotationStep:span)'; span]);
    nodeQuats = fetchEarthRotationQuats(gcrfFrame, earthFrame, epochDate, rotationNodeTimes);
    info.NumOrekitSamples = info.NumOrekitSamples + numel(rotationNodeTimes);
    [fineQuats, fineOmega] = slerpRotationHistory(rotationNodeTimes, nodeQuats, offsetsSeconds);
end

for g = 1:nextGroup
    members = find(groupId == g).';
    if isempty(members)
        continue;
    end
    ref = members(1);
    refSat = satellites{ref};

    % Phase offsets from mean anomaly, wrapped to +/- half a period using
    % two-body periodicity so the node window grows by at most one period.
    a = elements(ref, 1);
    e = elements(ref, 2);
    n = sqrt(mu / a^3);
    meanAnomaly = zeros(numel(members), 1);
    for m = 1:numel(members)
        nu = deg2rad(elements(members(m), 6));
        E = 2 * atan2(sqrt(1 - e) * sin(nu / 2), sqrt(1 + e) * cos(nu / 2));
        meanAnomaly(m) = E - e * sin(E);
    end
    deltaT = mod(meanAnomaly - meanAnomaly(1) + pi, 2 * pi) - pi;
    deltaT = deltaT / n;

    % Shared GCRF node grid covering every shifted query time.
    windowStart = min(0, min(deltaT));
    windowEnd = span + max(0, max(deltaT));
    nodeOffsets = unique([(windowStart:nodeStep:windowEnd)'; 0; span; windowEnd]);

    propagator = OrekitPropagatorFactory.createPropagator(refSat, config);
    nNodes = numel(nodeOffsets);
    nodeState = zeros(nNodes, 6);
    for k = 1:nNodes
        date = epochDate.shiftedBy(nodeOffsets(k));
        pv = propagator.propagate(date).getPVCoordinates(gcrfFrame);
        nodeState(k, :) = [pv.getPosition().toArray(); pv.getVelocity().toArray()]';
    end
    info.NumOrekitSamples = info.NumOrekitSamples + nNodes;

    posPP = pwch(nodeOffsets', nodeState(:, 1:3)', nodeState(:, 4:6)');
    velPP = spline(nodeOffsets', nodeState(:, 4:6)');

    for m = 1:numel(members)
        idx = members(m);
        dt = deltaT(m);

        % Exact inertial time-shift, then per-sample Earth rotation.
        gcrfPos = ppval(posPP, (offsetsSeconds + dt)')';
        gcrfVel = ppval(velPP, (offsetsSeconds + dt)')';
        satPos = quatRotateRows(fineQuats, gcrfPos);
        % v_E = R*v_G + omega_R x r_E, where omega_R is the angular rate of
        % the GCRF->ITRF map itself (~= -omega_earth * zhat), so this IS the
        % familiar "minus omega_earth cross r" - with the sign carried by
        % the measured rotation nodes instead of an assumed constant.
        satVel = quatRotateRows(fineQuats, gcrfVel) + cross(fineOmega, satPos, 2);

        if options.SpotCheckPoints > 0
            [maxErr, maxVelErr] = spotCheckSharedTrack(satellites{idx}, config, ...
                epochDate, earthFrame, posPP, velPP, dt, ...
                rotationNodeTimes, nodeQuats, nodeOffsets, span, options.SpotCheckPoints);
            info.SpotCheckMaxErrorMeters(idx) = maxErr;
            info.SpotCheckMaxVelErrorMps(idx) = maxVelErr;
            info.NumOrekitSamples = info.NumOrekitSamples + options.SpotCheckPoints;
            if maxErr > options.SpotCheckToleranceMeters
                warning("computeConstellationToGroundVectors:SpotCheckError", ...
                    "Shared-plane track for '%s' deviates up to %.3g m from its " + ...
                    "exact propagation (tolerance %.3g m).", ...
                    names(idx), maxErr, options.SpotCheckToleranceMeters);
            end
        end

        satResult = computeSatToGroundVectors({timeVector, satPos, satVel}, ...
            groundPoints, [], forwarded{:});
        satResult.Info.Mode = "SharedPlanePropagation";
        satResult.Info.ReferenceName = names(ref);
        satResult.Info.DeltaTSeconds = dt;
        satResult.Info.SpotCheckMaxErrorMeters = info.SpotCheckMaxErrorMeters(idx);
        results.Satellites{idx} = satResult;

        info.SatelliteMode(idx) = "SharedPlane";
        info.DeltaTSeconds(idx) = dt;
        info.ReferenceName(idx) = names(ref);
    end

    groupSummaries(end + 1) = struct("ReferenceName", names(ref), ...
        "MemberNames", names(members), "DeltaTSeconds", deltaT, ...
        "NodeCount", nNodes); %#ok<AGROW>
end

% --- Fallback: everyone not covered by a shared plane ---------------------
for k = 1:numSats
    if ~isempty(results.Satellites{k})
        continue;
    end
    satResult = computeSatToGroundVectors(satellites{k}, groundPoints, config, ...
        forwarded{:}, "JarRoot", options.JarRoot, "DataRoot", options.DataRoot);
    results.Satellites{k} = satResult;
    info.SatelliteMode(k) = "Individual";
    info.ReferenceName(k) = names(k);
    info.NumOrekitSamples = info.NumOrekitSamples + satResult.Info.NumOrekitSamples;
end

info.PropagationSeconds = toc(propagationTimer);
info.Groups = groupSummaries;
info.NumSatellites = numSats;
info.NumTimeSamples = numel(timeVector);
info.TotalSeconds = toc(totalTimer);
results.Info = info;
end

% ==========================================================================
function quats = fetchEarthRotationQuats(gcrfFrame, earthFrame, epochDate, nodeTimes)
% Exact GCRF->ITRF rotation at each node, measured by transforming the
% three GCRF basis vectors (the OrekitFrameTransform pattern): immune to
% quaternion/DCM convention ambiguity in the Java API.
n = numel(nodeTimes);
quats = zeros(n, 4);
basis = eye(3);
for k = 1:n
    date = epochDate.shiftedBy(nodeTimes(k));
    transform = gcrfFrame.getTransformTo(earthFrame, date);
    dcm = zeros(3, 3);
    for c = 1:3
        source = javaObject("org.hipparchus.geometry.euclidean.threed.Vector3D", ...
            basis(1, c), basis(2, c), basis(3, c));
        dcm(:, c) = transform.transformPosition(source).toArray();
    end
    quats(k, :) = dcmToQuatRow(dcm);
    if k > 1 && dot(quats(k, :), quats(k - 1, :)) < 0
        quats(k, :) = -quats(k, :);   % keep the sign continuous for slerp
    end
end
end

function q = dcmToQuatRow(dcm)
% Rotation matrix (r_out = dcm * r_in) to Hamilton scalar-first quaternion
% with the same active convention as quatRotateRows. Shepperd's method:
% pick the largest diagonal combination for numerical safety.
tr = trace(dcm);
[~, choice] = max([tr, dcm(1, 1), dcm(2, 2), dcm(3, 3)]);
switch choice
    case 1
        s = 2 * sqrt(1 + tr);
        q = [s / 4, (dcm(3, 2) - dcm(2, 3)) / s, ...
            (dcm(1, 3) - dcm(3, 1)) / s, (dcm(2, 1) - dcm(1, 2)) / s];
    case 2
        s = 2 * sqrt(1 + dcm(1, 1) - dcm(2, 2) - dcm(3, 3));
        q = [(dcm(3, 2) - dcm(2, 3)) / s, s / 4, ...
            (dcm(1, 2) + dcm(2, 1)) / s, (dcm(1, 3) + dcm(3, 1)) / s];
    case 3
        s = 2 * sqrt(1 - dcm(1, 1) + dcm(2, 2) - dcm(3, 3));
        q = [(dcm(1, 3) - dcm(3, 1)) / s, (dcm(1, 2) + dcm(2, 1)) / s, ...
            s / 4, (dcm(2, 3) + dcm(3, 2)) / s];
    otherwise
        s = 2 * sqrt(1 - dcm(1, 1) - dcm(2, 2) + dcm(3, 3));
        q = [(dcm(2, 1) - dcm(1, 2)) / s, (dcm(1, 3) + dcm(3, 1)) / s, ...
            (dcm(2, 3) + dcm(3, 2)) / s, s / 4];
end
q = q / norm(q);
end

function [fineQuats, fineOmega] = slerpRotationHistory(nodeTimes, nodeQuats, fineTimes)
% Vectorized slerp of the rotation nodes onto the fine grid, plus the
% angular velocity of each interval (from the quaternion log map - no
% assumed Earth-rate constant). Slerp is exact for uniform rotation; the
% real GCRF->ITRF motion deviates from uniform by nutation-scale terms,
% sub-centimeter over the default 600 s node spacing.
nodeTimes = nodeTimes(:);
segment = discretize(fineTimes(:), [nodeTimes(1:end - 1); inf]);
segment = min(max(segment, 1), numel(nodeTimes) - 1);
s = (fineTimes(:) - nodeTimes(segment)) ./ ...
    (nodeTimes(segment + 1) - nodeTimes(segment));

q0 = nodeQuats(1:end - 1, :);
q1 = nodeQuats(2:end, :);
qRel = quatMulRows(quatConjRows(q0), q1);
halfAngle = atan2(vecnorm(qRel(:, 2:4), 2, 2), qRel(:, 1));
axis = qRel(:, 2:4) ./ max(vecnorm(qRel(:, 2:4), 2, 2), eps);

% Per-interval angular velocity vector, expressed in ITRF: rotate the
% (GCRF-frame) rotation axis through the node attitude.
dtSeg = nodeTimes(2:end) - nodeTimes(1:end - 1);
omegaSeg = quatRotateRows(q0, axis .* (2 * halfAngle ./ dtSeg));

phase = s .* halfAngle(segment);
qStep = [cos(phase), sin(phase) .* axis(segment, :)];
fineQuats = quatMulRows(nodeQuats(segment, :), qStep);
fineOmega = omegaSeg(segment, :);
end

function out = quatMulRows(a, b)
% Hamilton product, scalar-first, row-wise.
out = [a(:, 1) .* b(:, 1) - sum(a(:, 2:4) .* b(:, 2:4), 2), ...
    a(:, 1) .* b(:, 2:4) + b(:, 1) .* a(:, 2:4) + cross(a(:, 2:4), b(:, 2:4), 2)];
end

function out = quatConjRows(q)
out = [q(:, 1), -q(:, 2:4)];
end

function out = quatRotateRows(q, v)
% Active rotation of each row vector by the matching row quaternion:
% out = R(q) * v, consistent with dcmToQuatRow.
qv = q(:, 2:4);
out = v + 2 * cross(qv, cross(qv, v, 2) + q(:, 1) .* v, 2);
end

function [maxErr, maxVelErr] = spotCheckSharedTrack(satellite, config, epochDate, ...
    earthFrame, posPP, velPP, dt, rotationNodeTimes, nodeQuats, nodeOffsets, span, numChecks)
% Compare the shared-track reconstruction against the satellite's OWN
% exact Orekit propagator (position and velocity) at orbit-node midpoints
% (worst-case Hermite error) mapped back into the scenario window. Catches
% interpolation error, phase-offset mistakes, and rotation or angular-
% velocity convention errors alike.
propagator = OrekitPropagatorFactory.createPropagator(satellite, config);

mids = nodeOffsets(1:end - 1) + diff(nodeOffsets) / 2;
checkTimes = mids - dt;
checkTimes = checkTimes(checkTimes >= 0 & checkTimes <= span);
if isempty(checkTimes)
    checkTimes = linspace(0, span, max(numChecks, 2))';
elseif numel(checkTimes) > numChecks
    checkTimes = checkTimes(round(linspace(1, numel(checkTimes), numChecks)));
end

[checkQuats, checkOmega] = slerpRotationHistory(rotationNodeTimes, nodeQuats, checkTimes);
gcrfPos = ppval(posPP, (checkTimes + dt)')';
gcrfVel = ppval(velPP, (checkTimes + dt)')';
sharedPos = quatRotateRows(checkQuats, gcrfPos);
sharedVel = quatRotateRows(checkQuats, gcrfVel) + cross(checkOmega, sharedPos, 2);

maxErr = 0;
maxVelErr = 0;
for k = 1:numel(checkTimes)
    date = epochDate.shiftedBy(checkTimes(k));
    pv = propagator.propagate(date).getPVCoordinates(earthFrame);
    exactPos = pv.getPosition().toArray();
    exactVel = pv.getVelocity().toArray();
    maxErr = max(maxErr, norm(sharedPos(k, :) - exactPos(:)'));
    maxVelErr = max(maxVelErr, norm(sharedVel(k, :) - exactVel(:)'));
end
end
