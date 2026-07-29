function handles = plotAdaptiveAzElTimeMesh(mesh, options)
%PLOTADAPTIVEAZELTIMEMESH Visualize the adaptive 2-D and sparse 3-D mesh.
%
% handles = plotAdaptiveAzElTimeMesh(mesh)
% handles = plotAdaptiveAzElTimeMesh(mesh, options)
%
% Options:
%   ViewMode          '2d', '3d', or 'combined' (default).
%   TimeIndex         2-D page, default middle retained sample.
%   VolumeContent     'free', 'blocked', or 'unresolved', default 'free'.
%   MaximumPrisms     Display cap, default 12000.
%   FaceAlpha         3-D volume alpha, default 0.12.
%   ShowCellEdges     Show 3-D prism edges, default false.
%   Figure            Existing figure or [].

if nargin < 2
    options = struct();
end
validateMesh(mesh);
options = normalizeOptions(options, mesh);
if isempty(options.Figure)
    figureHandle = figure( ...
        "Name", "Adaptive az/el/time discretization", ...
        "Color", "w");
else
    figureHandle = options.Figure;
    clf(figureHandle);
end

switch options.ViewMode
    case "2d"
        axes2d = axes(figureHandle);
        axes3d = gobjects(0);
    case "3d"
        axes2d = gobjects(0);
        axes3d = axes(figureHandle);
    otherwise
        layout = tiledlayout(figureHandle, 1, 2, ...
            "TileSpacing", "compact", "Padding", "compact");
        axes2d = nexttile(layout, 1);
        axes3d = nexttile(layout, 2);
end

mesh2d = gobjects(0);
mesh3d = gobjects(0);
if ~isempty(axes2d)
    mesh2d = drawTwoDimensionalMesh( ...
        axes2d, mesh, options.TimeIndex);
end
if ~isempty(axes3d)
    mesh3d = drawThreeDimensionalMesh(axes3d, mesh, options);
end
handles = struct( ...
    "Figure", figureHandle, ...
    "Axes2D", axes2d, ...
    "Axes3D", axes3d, ...
    "Mesh2D", mesh2d, ...
    "Mesh3D", mesh3d);
end

function output = drawTwoDimensionalMesh(axesHandle, mesh, timeIndex)
leafCount = numel(mesh.Leaves);
vertices = zeros(leafCount * 4, 2);
faces = reshape(1:leafCount * 4, 4, []).';
colors = zeros(leafCount, 3);
freeColor = [0.76 0.91 0.84];
blockedColor = [0.90 0.43 0.43];
unresolvedColor = [0.96 0.73 0.26];
for k = 1:leafCount
    bounds = mesh.Leaves(k).BoundsDeg;
    rows = (k - 1) * 4 + (1:4);
    vertices(rows, :) = [ ...
        bounds(1) bounds(3); ...
        bounds(2) bounds(3); ...
        bounds(2) bounds(4); ...
        bounds(1) bounds(4)];
    if mesh.Leaves(k).UnresolvedByTime(timeIndex)
        colors(k, :) = unresolvedColor;
    elseif mesh.Leaves(k).BlockedByTime(timeIndex)
        colors(k, :) = blockedColor;
    else
        colors(k, :) = freeColor;
    end
end
output = patch(axesHandle, ...
    "Faces", faces, "Vertices", vertices, ...
    "FaceVertexCData", colors, "FaceColor", "flat", ...
    "EdgeColor", [0.25 0.29 0.34], "LineWidth", 0.35);
axis(axesHandle, "equal", "tight");
grid(axesHandle, "on");
xlabel(axesHandle, "Azimuth (deg)");
ylabel(axesHandle, "Elevation (deg)");
title(axesHandle, sprintf( ...
    "Adaptive cells at t = %.3f s", mesh.TimeSeconds(timeIndex)));
end

function output = drawThreeDimensionalMesh(axesHandle, mesh, options)
[prisms, statusColor] = collectPrisms( ...
    mesh, options.VolumeContent, options.MaximumPrisms);
[vertices, faces] = prismGeometry(prisms, mesh.TimeSeconds);
if isempty(faces)
    output = patch(axesHandle, ...
        "Faces", zeros(0, 4), "Vertices", zeros(0, 3));
else
    if options.ShowCellEdges
        edgeColor = statusColor * 0.55;
    else
        edgeColor = "none";
    end
    output = patch(axesHandle, ...
        "Faces", faces, "Vertices", vertices, ...
        "FaceColor", statusColor, ...
        "FaceAlpha", options.FaceAlpha, ...
        "EdgeColor", edgeColor, "LineWidth", 0.25);
end
grid(axesHandle, "on");
view(axesHandle, 3);
xlabel(axesHandle, "Azimuth (deg)");
ylabel(axesHandle, "Elevation (deg)");
zlabel(axesHandle, "Time (s)");
title(axesHandle, sprintf( ...
    "Sparse %s prisms (%d shown)", ...
    options.VolumeContent, size(prisms, 1)));
axis(axesHandle, "tight");
end

function [prisms, color] = collectPrisms(mesh, content, maximum)
parts = cell(numel(mesh.Leaves), 1);
for k = 1:numel(mesh.Leaves)
    switch content
        case "free"
            mask = mesh.Leaves(k).FreeByTime;
            color = [0.18 0.62 0.72];
        case "blocked"
            mask = mesh.Leaves(k).BlockedByTime;
            color = [0.73 0.20 0.32];
        otherwise
            mask = mesh.Leaves(k).UnresolvedByTime;
            color = [0.92 0.58 0.10];
    end
    changes = diff([false; mask(:); false]);
    starts = find(changes == 1);
    stops = find(changes == -1) - 1;
    count = numel(starts);
    parts{k} = [ ...
        repmat(mesh.Leaves(k).BoundsDeg, count, 1), starts, stops];
end
prisms = vertcat(parts{:});
if size(prisms, 1) > maximum
    keep = unique(round(linspace(1, size(prisms, 1), maximum)));
    prisms = prisms(keep, :);
end
end

function [vertices, faces] = prismGeometry(prisms, timeSeconds)
count = size(prisms, 1);
vertices = zeros(count * 8, 3);
faces = zeros(count * 6, 4);
timeEdges = sampleEdges(timeSeconds);
baseFaces = [ ...
    1 2 3 4; 5 8 7 6; ...
    1 5 6 2; 2 6 7 3; ...
    3 7 8 4; 4 8 5 1];
for k = 1:count
    bounds = prisms(k, 1:4);
    lowerTime = timeEdges(prisms(k, 5));
    upperTime = timeEdges(prisms(k, 6) + 1);
    vertexRows = (k - 1) * 8 + (1:8);
    vertices(vertexRows, :) = [ ...
        bounds(1) bounds(3) lowerTime; ...
        bounds(2) bounds(3) lowerTime; ...
        bounds(2) bounds(4) lowerTime; ...
        bounds(1) bounds(4) lowerTime; ...
        bounds(1) bounds(3) upperTime; ...
        bounds(2) bounds(3) upperTime; ...
        bounds(2) bounds(4) upperTime; ...
        bounds(1) bounds(4) upperTime];
    faceRows = (k - 1) * 6 + (1:6);
    faces(faceRows, :) = baseFaces + (k - 1) * 8;
end
end

function edges = sampleEdges(timeSeconds)
timeSeconds = double(timeSeconds(:));
if isscalar(timeSeconds)
    edges = [timeSeconds - 0.5; timeSeconds + 0.5];
    return;
end
middle = 0.5 * (timeSeconds(1:end - 1) + timeSeconds(2:end));
edges = [ ...
    timeSeconds(1) - 0.5 * (timeSeconds(2) - timeSeconds(1)); ...
    middle; ...
    timeSeconds(end) + 0.5 * ...
    (timeSeconds(end) - timeSeconds(end - 1))];
end

function options = normalizeOptions(options, mesh)
defaults = struct( ...
    "ViewMode", "combined", ...
    "TimeIndex", max(1, round(numel(mesh.TimeSeconds) / 2)), ...
    "VolumeContent", "free", ...
    "MaximumPrisms", 12000, ...
    "FaceAlpha", 0.12, ...
    "ShowCellEdges", false, ...
    "Figure", []);
options = applyDefaults(options, defaults);
options.ViewMode = string(validatestring( ...
    options.ViewMode, {'2d', '3d', 'combined'}));
options.VolumeContent = string(validatestring( ...
    options.VolumeContent, {'free', 'blocked', 'unresolved'}));
validateattributes(options.TimeIndex, {'numeric'}, ...
    {'scalar', 'integer', '>=', 1, '<=', numel(mesh.TimeSeconds)});
validateattributes(options.MaximumPrisms, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.FaceAlpha, {'numeric'}, ...
    {'scalar', 'real', 'finite', '>=', 0, '<=', 1});
validateattributes(options.ShowCellEdges, {'logical', 'numeric'}, ...
    {'scalar'});
options.ShowCellEdges = logical(options.ShowCellEdges);
end

function validateMesh(mesh)
if ~isstruct(mesh) || ~isscalar(mesh) || ...
        ~isfield(mesh, "Format") || ...
        mesh.Format ~= "AdaptiveAzElTimeMesh"
    error("plotAdaptiveAzElTimeMesh:InvalidMesh", ...
        "Use buildAdaptiveAzElTimeMesh to create mesh.");
end
end

function output = applyDefaults(input, defaults)
output = input;
names = fieldnames(defaults);
for k = 1:numel(names)
    if ~isfield(output, names{k}) || isempty(output.(names{k}))
        output.(names{k}) = defaults.(names{k});
    end
end
end
