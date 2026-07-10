function result = computeSatToGroundVectors(satelliteSource, groundPoints, config, options)
%COMPUTESATTOGROUNDVECTORS Fast satellite-to-ground look vectors over a scenario.
%
% Orekit propagation mode (parallelized across process workers):
%   result = computeSatToGroundVectors(sat, groundPoints, cfg)
%   result = computeSatToGroundVectors(sat, groundPoints, cfg, "UseParallel", true)
%
% Imported-ECEF modes (no Orekit needed at all):
%   result = computeSatToGroundVectors(ephemerisTable, groundPoints)
%       ephemerisTable must contain Time plus ECEF_X_m / ECEF_Y_m / ECEF_Z_m
%       columns (the format written by exportEphemeris).
%   result = computeSatToGroundVectors({timeVector, ecefN3}, groundPoints)
%   result = computeSatToGroundVectors({timeVector, ecefN3, ecefVelN3}, groundPoints)
%       timeVector is N-by-1 datetime, ecefN3 is N-by-3 ECEF meters, and
%       the optional ecefVelN3 is N-by-3 ECEF velocity [m/s] (needed for
%       exact LVLH attitude in imported mode).
%
% groundPoints is one of:
%   * M-by-3 numeric [latitudeDeg longitudeDeg altitudeMeters]
%   * M-by-2 numeric [latitudeDeg longitudeDeg] (altitude 0)
%   * a cell array of objects with LatitudeDeg / LongitudeDeg properties
%     (GroundStationObject, PlaceObject, TargetObject, FacilityObject, ...)
%
% Name-value options:
%   UseParallel        "auto" (default) | true | false. Parallelizes the
%                      Orekit propagation phase over a process-based pool.
%   MaxWorkers         Cap on pool size when this function opens the pool.
%   MinSamplesPerChunk Minimum time samples per parfor chunk (default 500).
%   ComputeAER         Also compute azimuth/elevation (default true).
%   UseGPU             Run the geometry phase on a GPU if present (default false).
%   BodyFrame          Also express every look vector in the satellite
%                      BODY frame (default false). Adds LookBodyMeters and
%                      LookUnitBody (N-by-3-by-M), BodyDcmEcef (3-by-3-by-N),
%                      and SatVelEcefMeters when velocity was used.
%   AttitudeMode       Body attitude convention when BodyFrame is true and
%                      no quaternions are given: "LVLH_CCSDS" (default,
%                      +Z nadir, +Y = -orbit momentum, +X ~ velocity;
%                      identical to Orekit VVLH) or "QSW" (Orekit's plain
%                      LVLH: +X zenith, +Z = +orbit momentum).
%   AttitudeQuaternions  N-by-4 measured/commanded attitude [w x y z],
%                      Hamilton scalar-first, rotating ECEF into body
%                      (vBody = R(q) * vEcef). Overrides AttitudeMode and
%                      removes the need for velocity entirely.
%   PropagationStepSeconds  "auto" (default) | 0/"off" | positive seconds.
%                      Orekit is sampled only every H seconds (position AND
%                      velocity at each node) and the fine time grid is
%                      filled by cubic Hermite interpolation in pure
%                      MATLAB. Orbits are smooth, so at the default H=60s
%                      the interpolation error is sub-meter for LEO
%                      (measured 0.29 m max over 24 h) while cutting Java
%                      bridge traffic by ~60x. "auto" engages only when it
%                      actually reduces the sample count; 0 or "off" forces
%                      exact per-sample propagation (the old behavior).
%   InterpolationCheckPoints  Default 16. When interpolating, spot-verify
%                      this many node-midpoints (where Hermite error peaks)
%                      against exact Orekit propagation; the measured max
%                      error is reported in Info. 0 disables the check.
%   InterpolationToleranceMeters  Default 1.0. Warn if the spot-check
%                      error exceeds this.
%   JarRoot, DataRoot  Orekit runtime locations for non-default installs;
%                      forwarded to every worker's OrekitInitializer.
%
% Returns a struct with Time (N-by-1), SatEcefMeters (N-by-3), GroundNames,
% GroundLLA, GroundEcefMeters, LookEcefMeters (N-by-3-by-M, satellite ->
% ground), LookUnitEcef, RangeMeters (N-by-M), AzimuthDeg/ElevationDeg
% (N-by-M, satellite as seen from each ground point), and an Info struct
% with timing and parallelization details.
%
% How the speed is obtained:
%   1. Orekit is only sampled at coarse nodes (default every 60 s) and the
%      fine grid comes from cubic Hermite interpolation using the exact
%      node velocities as slopes - for an 86,401-sample day this replaces
%      ~520k Java bridge calls with ~4k plus a 0.3 s vectorized MATLAB
%      pass, at sub-meter cost. Midpoint spot-checks against exact Orekit
%      guard the accuracy claim at runtime.
%   2. What Java traffic remains is minimized per sample: Vector3D.toArray
%      returns all three components in ONE bridge call (measured 2.7x
%      faster per sample than getX/getY/getZ), and large exact-mode runs
%      are split into chunks across PROCESS workers. Each worker owns a
%      JVM, loads the Orekit JARs once (persistent guard), and builds its
%      own cheap analytic propagator - Java objects are never serialized
%      across the pool boundary.
%   3. Everything after satellite ECEF is pure vectorized MATLAB: one
%      implicit-expansion subtraction produces all N-by-M look vectors and
%      one batched pagemtimes produces all ENU rotations. No loop over
%      time, no Java, optional gpuArray.
%   4. The body-frame conversion is attitude-from-state: LVLH/QSW axes
%      are built directly from ECEF position and velocity (adding the
%      omega x r term to recover inertial velocity), so attitude costs
%      zero Java calls too, and the ECEF->body rotation of all N-by-M
%      vectors is three implicit-expansion accumulations.
%   Thread-based pools (parpool("Threads")) cannot call Java, so this
%   function requires/opens a process pool and falls back to serial if
%   only a thread pool is available.

arguments
    satelliteSource
    groundPoints
    config = []
    options.UseParallel = "auto"
    options.MaxWorkers (1, 1) double = Inf
    options.MinSamplesPerChunk (1, 1) double {mustBePositive} = 500
    options.ComputeAER (1, 1) logical = true
    options.UseGPU (1, 1) logical = false
    options.BodyFrame (1, 1) logical = false
    options.AttitudeMode (1, 1) string = "LVLH_CCSDS"
    options.AttitudeQuaternions double = []
    options.PropagationStepSeconds = "auto"
    options.InterpolationCheckPoints (1, 1) double {mustBeNonnegative} = 16
    options.InterpolationToleranceMeters (1, 1) double {mustBePositive} = 1.0
    options.JarRoot string = ""
    options.DataRoot string = ""
end

totalTimer = tic;
[groundLLA, groundNames] = normalizeGroundPoints(groundPoints);

useCustomQuaternions = ~isempty(options.AttitudeQuaternions);
needVelocity = options.BodyFrame && ~useCustomQuaternions;
satVelEcef = [];

propagationTimer = tic;
if isa(satelliteSource, "SatelliteObject")
    if isempty(config) || ~isa(config, "ScenarioConfig")
        error("computeSatToGroundVectors:MissingConfig", ...
            "Propagation mode requires a ScenarioConfig as the third argument.");
    end
    [timeVector, satState, info] = propagateSatelliteEcef(satelliteSource, config, options, needVelocity);
    satEcef = satState(:, 1:3);
    if needVelocity
        satVelEcef = satState(:, 4:6);
    end
elseif istable(satelliteSource)
    [timeVector, satEcef] = ecefFromEphemerisTable(satelliteSource);
    info = struct("Mode", "ImportedTable", "UsedParallel", false, "NumWorkers", 0, "NumChunks", 0);
elseif iscell(satelliteSource) && any(numel(satelliteSource) == [2 3])
    timeVector = satelliteSource{1};
    satEcef = double(satelliteSource{2});
    if ~isdatetime(timeVector)
        error("computeSatToGroundVectors:InvalidImportedTime", ...
            "Imported mode expects {timeVector, ecefN3} with a datetime time vector.");
    end
    timeVector = timeVector(:);
    if size(satEcef, 2) ~= 3 || size(satEcef, 1) ~= numel(timeVector)
        error("computeSatToGroundVectors:InvalidImportedEcef", ...
            "Imported ECEF must be N-by-3 with N matching the time vector length.");
    end
    if numel(satelliteSource) == 3
        satVelEcef = double(satelliteSource{3});
        if ~isequal(size(satVelEcef), size(satEcef))
            error("computeSatToGroundVectors:InvalidImportedVelocity", ...
                "Imported ECEF velocity must be N-by-3, matching the positions.");
        end
    end
    info = struct("Mode", "ImportedMatrix", "UsedParallel", false, "NumWorkers", 0, "NumChunks", 0);
else
    error("computeSatToGroundVectors:InvalidSource", ...
        "First argument must be a SatelliteObject, an ephemeris table, or {timeVector, ecefN3}.");
end
info.PropagationSeconds = toc(propagationTimer);

geometryTimer = tic;
geometry = ecefLookGeometry(satEcef, groundLLA, ...
    "ComputeAER", options.ComputeAER, "UseGPU", options.UseGPU);
info.GeometrySeconds = toc(geometryTimer);

result = struct();
result.Time = timeVector;
result.SatEcefMeters = satEcef;
result.GroundNames = groundNames;
result.GroundLLA = groundLLA;
result.GroundEcefMeters = geometry.GroundEcefMeters;
result.LookEcefMeters = geometry.LookEcefMeters;
result.LookUnitEcef = geometry.LookUnitEcef;
result.RangeMeters = geometry.RangeMeters;
if options.ComputeAER
    result.AzimuthDeg = geometry.AzimuthDeg;
    result.ElevationDeg = geometry.ElevationDeg;
end

if options.BodyFrame
    bodyTimer = tic;
    if useCustomQuaternions
        quats = double(options.AttitudeQuaternions);
        if ~isequal(size(quats), [numel(timeVector), 4])
            error("computeSatToGroundVectors:InvalidQuaternions", ...
                "AttitudeQuaternions must be N-by-4 [w x y z] with one row per time sample.");
        end
        [result.LookBodyMeters, result.BodyDcmEcef] = ...
            ecefToBodyVectors(result.LookEcefMeters, quats);
        info.AttitudeMode = "Quaternions";
    else
        if isempty(satVelEcef)
            warning("computeSatToGroundVectors:DerivedVelocity", ...
                "No ECEF velocity available for LVLH attitude; deriving it by " + ...
                "central differences of the imported positions. Supply " + ...
                "{time, pos, vel} or AttitudeQuaternions for exact attitude.");
            satVelEcef = deriveEcefVelocity(timeVector, satEcef);
        end
        result.BodyDcmEcef = lvlhFromEcefState(satEcef, satVelEcef, ...
            "Convention", options.AttitudeMode);
        result.LookBodyMeters = ecefToBodyVectors(result.LookEcefMeters, result.BodyDcmEcef);
        info.AttitudeMode = options.AttitudeMode;
    end
    result.LookUnitBody = result.LookBodyMeters ./ ...
        reshape(result.RangeMeters, size(result.RangeMeters, 1), 1, []);
    if ~isempty(satVelEcef)
        result.SatVelEcefMeters = satVelEcef;
    end
    info.BodyFrameSeconds = toc(bodyTimer);
end

info.TotalSeconds = toc(totalTimer);
info.NumTimeSamples = numel(timeVector);
info.NumGroundPoints = size(groundLLA, 1);
result.Info = info;
end

function [timeVector, satState, info] = propagateSatelliteEcef(satellite, config, options, fetchVelocity)
config.validate();
satellite.validate();
timeVector = config.getTimeVector();
n = numel(timeVector);

if ~isempty(satellite.Maneuvers)
    warning("computeSatToGroundVectors:ManeuversIgnored", ...
        "This fast path propagates the maneuver-free orbit; the satellite's " + ...
        "%d maneuver(s) are ignored. Use SatelliteObject.propagate + the " + ...
        "imported-ephemeris mode to include them.", numel(satellite.Maneuvers));
end

% Never ship Java handles or bulky tables across the pool boundary.
satellite.OrekitPropagator = [];
satellite.Ephemeris = table();

repoRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
jarRoot = options.JarRoot;
dataRoot = options.DataRoot;

epoch = timeVector(1);
offsetsSeconds = seconds(timeVector - epoch);

% Coarse-node interpolation: sample Orekit every H seconds instead of at
% every fine step. Hermite needs slopes, so nodes always fetch velocity.
stepSeconds = resolvePropagationStep(options, offsetsSeconds);
interpolate = stepSeconds > 0;
if interpolate
    sampleOffsets = unique([(0:stepSeconds:offsetsSeconds(end))'; offsetsSeconds(end)]);
    fetchVelAtSamples = true;
else
    sampleOffsets = offsetsSeconds;
    fetchVelAtSamples = fetchVelocity;
end
nSamples = numel(sampleOffsets);

[useParallel, pool] = resolveParallel(options, nSamples);

info = struct("Mode", "OrekitPropagation", "UsedParallel", useParallel);

if useParallel
    numWorkers = pool.NumWorkers;
    numChunks = min(nSamples, max(numWorkers, ...
        min(numWorkers * 4, floor(nSamples / options.MinSamplesPerChunk))));
    numChunks = max(numChunks, 1);
    edges = round(linspace(0, nSamples, numChunks + 1));

    offsetChunks = cell(numChunks, 1);
    for c = 1:numChunks
        offsetChunks{c} = sampleOffsets(edges(c) + 1:edges(c + 1));
    end

    ecefChunks = cell(numChunks, 1);
    parfor c = 1:numChunks
        ecefChunks{c} = propagateEcefChunk(satellite, config, epoch, ...
            offsetChunks{c}, repoRoot, jarRoot, dataRoot, fetchVelAtSamples);
    end
    sampleState = vertcat(ecefChunks{:});
    info.NumWorkers = numWorkers;
    info.NumChunks = numChunks;
else
    sampleState = propagateEcefChunk(satellite, config, epoch, ...
        sampleOffsets, repoRoot, jarRoot, dataRoot, fetchVelAtSamples);
    info.NumWorkers = 0;
    info.NumChunks = 1;
end

info.Interpolated = interpolate;
info.PropagationStepSeconds = stepSeconds;
info.NumOrekitSamples = nSamples;

if ~interpolate
    satState = sampleState;
    return;
end

% Cubic Hermite through the node positions with exact Orekit velocities as
% slopes: error <= H^4/384 * max|d4r/dt4|, measured 0.29 m at H=60s for LEO.
pp = pwch(sampleOffsets', sampleState(:, 1:3)', sampleState(:, 4:6)');
satState = ppval(pp, offsetsSeconds')';
if fetchVelocity
    % Spline the exact node velocities rather than differentiating the
    % position Hermite: differentiation degrades to O(H^3) and multiplies
    % the LVLH attitude error ~10x (measured 2.9 m vs 0.3 m on body-frame
    % look vectors); a direct spline keeps velocity at O(H^4).
    velPP = spline(sampleOffsets', sampleState(:, 4:6)');
    satState = [satState, ppval(velPP, offsetsSeconds')'];
end

if options.InterpolationCheckPoints > 0
    maxErr = spotCheckInterpolation(satellite, config, epoch, pp, ...
        sampleOffsets, repoRoot, jarRoot, dataRoot, options.InterpolationCheckPoints);
    info.InterpolationMaxCheckedErrorMeters = maxErr;
    if maxErr > options.InterpolationToleranceMeters
        warning("computeSatToGroundVectors:InterpolationError", ...
            "Interpolated positions deviate up to %.3g m from exact Orekit " + ...
            "propagation (tolerance %.3g m). Reduce PropagationStepSeconds " + ...
            "or pass PropagationStepSeconds=0 for exact sampling.", ...
            maxErr, options.InterpolationToleranceMeters);
    end
end
end

function stepSeconds = resolvePropagationStep(options, offsetsSeconds)
% 0 means "no interpolation, sample every fine step exactly".
pref = options.PropagationStepSeconds;
duration = offsetsSeconds(end) - offsetsSeconds(1);
n = numel(offsetsSeconds);

if isnumeric(pref)
    if ~isscalar(pref) || ~isfinite(pref) || pref < 0
        error("computeSatToGroundVectors:InvalidPropagationStep", ...
            "PropagationStepSeconds must be ""auto"", ""off"", or a finite scalar >= 0.");
    end
    if pref == 0 || duration <= 0
        stepSeconds = 0;
    else
        % Honor the request but keep at least 5 interpolation nodes.
        stepSeconds = min(double(pref), duration / 4);
    end
    return;
end

choice = lower(string(pref));
if choice == "off" || choice == "exact" || choice == "none"
    stepSeconds = 0;
    return;
end
if choice ~= "auto"
    error("computeSatToGroundVectors:InvalidPropagationStep", ...
        "PropagationStepSeconds must be ""auto"", ""off"", or a scalar in seconds.");
end

% Auto: engage only when coarse sampling meaningfully cuts the Java calls.
if n < 240 || duration <= 0
    stepSeconds = 0;
    return;
end
fineStep = duration / (n - 1);
stepSeconds = min(60, duration / 8);
if stepSeconds <= fineStep * 4
    stepSeconds = 0;
end
end

function maxErr = spotCheckInterpolation(satellite, config, epoch, pp, nodeOffsets, repoRoot, jarRoot, dataRoot, numChecks)
% Hermite error peaks mid-interval, so checking node midpoints bounds the
% whole grid. Runs on the client; ascending dates keep numerical
% propagators stepping forward.
ensureProcessOrekitReady(repoRoot, jarRoot, dataRoot);
propagator = OrekitPropagatorFactory.createPropagator(satellite, config);
earthFrame = OrekitFrames.earthFrame();
epochDate = OrekitTime.toAbsoluteDate(epoch);

mids = nodeOffsets(1:end - 1) + diff(nodeOffsets) / 2;
if numel(mids) > numChecks
    mids = mids(round(linspace(1, numel(mids), numChecks)));
end
interpPos = ppval(pp, mids')';

maxErr = 0;
for k = 1:numel(mids)
    date = epochDate.shiftedBy(mids(k));
    exact = propagator.getPosition(date, earthFrame).toArray();
    maxErr = max(maxErr, norm(interpPos(k, :) - exact(:)'));
end
end

function stateEcef = propagateEcefChunk(satellite, config, epoch, offsetsSeconds, repoRoot, jarRoot, dataRoot, fetchVelocity)
% Runs on a worker (or the client, serially). Initializes Orekit in this
% process once, builds a local propagator, and fetches ONLY the ITRF
% position (plus velocity when needed) per sample. Vector3D.toArray()
% moves all three components across the bridge in one call - measured
% 156 us/sample for position vs 423 us with getX/getY/getZ.
ensureProcessOrekitReady(repoRoot, jarRoot, dataRoot);

propagator = OrekitPropagatorFactory.createPropagator(satellite, config);
earthFrame = OrekitFrames.earthFrame();
epochDate = OrekitTime.toAbsoluteDate(epoch);

n = numel(offsetsSeconds);
stateEcef = zeros(n, 3 + 3 * fetchVelocity);
for k = 1:n
    date = epochDate.shiftedBy(offsetsSeconds(k));
    if fetchVelocity
        pv = propagator.propagate(date).getPVCoordinates(earthFrame);
        stateEcef(k, :) = [pv.getPosition().toArray(); pv.getVelocity().toArray()]';
    else
        stateEcef(k, :) = propagator.getPosition(date, earthFrame).toArray()';
    end
end
end

function velEcef = deriveEcefVelocity(timeVector, posEcef)
n = size(posEcef, 1);
if n < 2
    error("computeSatToGroundVectors:TooFewSamplesForVelocity", ...
        "At least two time samples are required to derive velocity.");
end
t = seconds(timeVector(:) - timeVector(1));
velEcef = zeros(n, 3);
velEcef(2:n - 1, :) = (posEcef(3:n, :) - posEcef(1:n - 2, :)) ./ (t(3:n) - t(1:n - 2));
velEcef(1, :) = (posEcef(2, :) - posEcef(1, :)) ./ (t(2) - t(1));
velEcef(n, :) = (posEcef(n, :) - posEcef(n - 1, :)) ./ (t(n) - t(n - 1));
end

function ensureProcessOrekitReady(repoRoot, jarRoot, dataRoot)
% Each process worker has its own JVM and its own MATLAB path, so the
% Orekit classpath and data providers must be configured per process. The
% persistent flag makes this a one-time cost per worker per pool.
persistent ready
if isequal(ready, true)
    return;
end
if exist("OrekitInitializer", "class") ~= 8
    addpath(genpath(fullfile(repoRoot, "src")));
end
if strlength(string(jarRoot)) == 0
    OrekitInitializer.initialize();
else
    OrekitInitializer.initialize(char(jarRoot), char(dataRoot));
end
ready = true;
end

function [useParallel, pool] = resolveParallel(options, numSamples)
pool = [];
pref = options.UseParallel;

if isequal(pref, false)
    useParallel = false;
    return;
end

haveToolbox = license("test", "Distrib_Computing_Toolbox") && ~isempty(ver("parallel"));
if ~haveToolbox
    if isequal(pref, true)
        warning("computeSatToGroundVectors:NoParallelToolbox", ...
            "Parallel Computing Toolbox is not available; running serially.");
    end
    useParallel = false;
    return;
end

% Auto mode: the pool only pays off once the Java call count is large.
if ~isequal(pref, true) && numSamples < 4000
    useParallel = false;
    return;
end

pool = gcp("nocreate");
if ~isempty(pool) && isa(pool, "parallel.ThreadPool")
    warning("computeSatToGroundVectors:ThreadPool", ...
        "The current pool is thread-based and threads cannot call Java. " + ...
        "Running serially. Use delete(gcp) then parpool(""Processes"") for a parallel run.");
    useParallel = false;
    pool = [];
    return;
end

if isempty(pool)
    try
        if isfinite(options.MaxWorkers)
            pool = parpool("Processes", options.MaxWorkers);
        else
            pool = parpool("Processes");
        end
    catch poolErr
        warning("computeSatToGroundVectors:PoolFailed", ...
            "Could not open a process pool (%s); running serially.", poolErr.message);
        useParallel = false;
        pool = [];
        return;
    end
end
useParallel = true;
end

function [timeVector, satEcef] = ecefFromEphemerisTable(ephemeris)
vars = string(ephemeris.Properties.VariableNames);
required = ["Time", "ECEF_X_m", "ECEF_Y_m", "ECEF_Z_m"];
if ~all(ismember(required, vars))
    error("computeSatToGroundVectors:MissingEcefColumns", ...
        "Ephemeris table must contain Time, ECEF_X_m, ECEF_Y_m, ECEF_Z_m " + ...
        "(the exportEphemeris format). Refusing to fall back to X_m/Y_m/Z_m " + ...
        "because those columns are inertial (GCRF), not Earth-fixed.");
end
timeVector = ephemeris.Time(:);
satEcef = [ephemeris.ECEF_X_m(:), ephemeris.ECEF_Y_m(:), ephemeris.ECEF_Z_m(:)];
end

function [groundLLA, groundNames] = normalizeGroundPoints(groundPoints)
if isnumeric(groundPoints)
    if size(groundPoints, 2) == 2
        groundPoints = [groundPoints, zeros(size(groundPoints, 1), 1)];
    end
    if size(groundPoints, 2) ~= 3 || isempty(groundPoints)
        error("computeSatToGroundVectors:InvalidGroundPoints", ...
            "Numeric ground points must be a non-empty M-by-2 or M-by-3 matrix.");
    end
    groundLLA = double(groundPoints);
    groundNames = "Ground-" + string(1:size(groundLLA, 1)).';
    return;
end

if ~iscell(groundPoints)
    groundPoints = {groundPoints};
end
m = numel(groundPoints);
groundLLA = zeros(m, 3);
groundNames = strings(m, 1);
for k = 1:m
    candidate = groundPoints{k};
    if ~(isprop(candidate, "LatitudeDeg") && isprop(candidate, "LongitudeDeg"))
        error("computeSatToGroundVectors:InvalidGroundObject", ...
            "Ground point %d has no LatitudeDeg/LongitudeDeg properties.", k);
    end
    altitude = 0;
    if isprop(candidate, "AltitudeMeters")
        altitude = candidate.AltitudeMeters;
    end
    groundLLA(k, :) = [candidate.LatitudeDeg, candidate.LongitudeDeg, altitude];
    if isprop(candidate, "Name")
        groundNames(k) = string(candidate.Name);
    else
        groundNames(k) = "Ground-" + k;
    end
end
end
