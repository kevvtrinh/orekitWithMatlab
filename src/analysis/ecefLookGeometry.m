function geometry = ecefLookGeometry(satEcefMeters, groundLLA, options)
%ECEFLOOKGEOMETRY Vectorized satellite-to-ground geometry from ECEF positions.
%
% geometry = ecefLookGeometry(satEcefMeters, groundLLA)
% geometry = ecefLookGeometry(satEcefMeters, groundLLA, "ComputeAER", true, "UseGPU", false)
%
% satEcefMeters  N-by-3 satellite ECEF (ITRF) positions [m]
% groundLLA      M-by-3 ground points [latitudeDeg longitudeDeg altitudeMeters]
%
% Returns a struct with, for N times and M ground points:
%   GroundEcefMeters  M-by-3 ground point ECEF positions
%   LookEcefMeters    N-by-3-by-M vectors FROM the satellite TO each ground point
%   LookUnitEcef      N-by-3-by-M unit look vectors
%   RangeMeters       N-by-M slant ranges
%   AzimuthDeg        N-by-M satellite azimuth seen from each ground point
%                     (from North, positive toward East; same convention as
%                     Orekit's TopocentricFrame)
%   ElevationDeg      N-by-M satellite elevation above the local geodetic horizon
%
% Performance notes: this is the deliberately Java-free half of the
% pipeline. Everything is a single implicit-expansion pass over an
% N-by-3-by-M array plus one batched pagemtimes for the ENU rotations, so
% there is no loop over time and no MATLAB<->Java bridge cost. Millions of
% time-by-ground combinations resolve in milliseconds; an optional
% gpuArray path is available for very large problems.

arguments
    satEcefMeters (:, 3) double
    groundLLA (:, :) double
    options.ComputeAER (1, 1) logical = true
    options.UseGPU (1, 1) logical = false
end

if size(groundLLA, 2) == 2
    groundLLA = [groundLLA, zeros(size(groundLLA, 1), 1)];
elseif size(groundLLA, 2) ~= 3
    error("ecefLookGeometry:InvalidGroundPoints", ...
        "Ground points must be M-by-2 [lat lon] or M-by-3 [lat lon altMeters].");
end

numTimes = size(satEcefMeters, 1);
numGround = size(groundLLA, 1);

% Vectorized WGS84 geodetic -> ECEF for every ground point at once.
a = OrekitConstants.WGS84EarthEquatorialRadiusMeters;
f = OrekitConstants.WGS84EarthFlattening;
e2 = f * (2.0 - f);
lat = deg2rad(groundLLA(:, 1));
lon = deg2rad(groundLLA(:, 2));
alt = groundLLA(:, 3);
sinLat = sin(lat); cosLat = cos(lat);
sinLon = sin(lon); cosLon = cos(lon);
primeVertical = a ./ sqrt(1.0 - e2 * sinLat.^2);
groundEcef = [(primeVertical + alt) .* cosLat .* cosLon, ...
    (primeVertical + alt) .* cosLat .* sinLon, ...
    (primeVertical .* (1.0 - e2) + alt) .* sinLat];

useGpu = false;
if options.UseGPU
    try
        useGpu = gpuDeviceCount > 0;
    catch
        useGpu = false;
    end
    if ~useGpu
        warning("ecefLookGeometry:NoGPU", ...
            "UseGPU requested but no GPU is available; using the CPU path.");
    end
end
if useGpu
    satEcefMeters = gpuArray(satEcefMeters);
    groundEcef = gpuArray(groundEcef);
end

% All N-by-M look vectors in one implicit-expansion operation:
% (1-by-3-by-M ground) minus (N-by-3 satellite) -> N-by-3-by-M.
lookEcef = reshape(groundEcef.', 1, 3, numGround) - satEcefMeters;
rangeMeters = reshape(vecnorm(lookEcef, 2, 2), numTimes, numGround);
lookUnit = lookEcef ./ reshape(rangeMeters, numTimes, 1, numGround);

geometry = struct();
geometry.GroundEcefMeters = gather(groundEcef);
geometry.LookEcefMeters = gather(lookEcef);
geometry.LookUnitEcef = gather(lookUnit);
geometry.RangeMeters = gather(rangeMeters);

if options.ComputeAER
    % ENU basis rows per ground point, stacked as R(:,:,j) = [E; N; U].
    east = [-sinLon, cosLon, zeros(numGround, 1)];
    north = [-sinLat .* cosLon, -sinLat .* sinLon, cosLat];
    up = [cosLat .* cosLon, cosLat .* sinLon, sinLat];
    enuBasis = permute(cat(3, east, north, up), [3 2 1]); % 3-by-3-by-M
    if useGpu
        enuBasis = gpuArray(enuBasis);
    end

    % Satellite as seen FROM the ground: sat - ground = -look.
    satFromGround = -lookEcef;
    if exist("pagemtimes", "builtin") == 5
        % Batched N-by-3-by-M times 3-by-3-by-M rotation in one BLAS call.
        enu = pagemtimes(satFromGround, "none", enuBasis, "transpose");
    else
        enu = zeros(numTimes, 3, numGround, "like", satFromGround);
        for j = 1:numGround
            enu(:, :, j) = satFromGround(:, :, j) * enuBasis(:, :, j).';
        end
    end

    eastComp = reshape(enu(:, 1, :), numTimes, numGround);
    northComp = reshape(enu(:, 2, :), numTimes, numGround);
    upComp = reshape(enu(:, 3, :), numTimes, numGround);
    geometry.AzimuthDeg = gather(mod(atan2d(eastComp, northComp), 360.0));
    geometry.ElevationDeg = gather(atan2d(upComp, hypot(eastComp, northComp)));
end
end
