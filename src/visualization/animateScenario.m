function handles = animateScenario(scenario, varargin)
%ANIMATESCENARIO Script-mode scenario animation.

arguments
    scenario MissionScenario
end
arguments (Repeating)
    varargin
end

options = parseAnimationOptions(varargin{:});

controller = AnimationController(scenario.Config);
timeVector = scenario.Config.getTimeVector();

fig = figure("Name", "Mission Scenario Animation");
ax = axes(fig);
hold(ax, "on");
grid(ax, "on");
xlabel(ax, "Longitude (deg)");
ylabel(ax, "Latitude (deg)");
xlim(ax, [-180 180]);
ylim(ax, [-90 90]);
title(ax, "Scenario Animation");
try
    coast = load("coastlines");
    plot(ax, coast.coastlon, coast.coastlat, "Color", [0.15 0.35 0.18]);
catch
end

stationHandles = gobjects(0);
satHandles = gobjects(0);
for k = 1:numel(scenario.Objects)
    obj = scenario.Objects{k};
    if isa(obj, "GroundStationObject")
        stationHandles(end + 1) = scatter(ax, obj.LongitudeDeg, obj.LatitudeDeg, ...
            55, "filled", "MarkerFaceColor", obj.Color); %#ok<AGROW>
    elseif isa(obj, "SatelliteObject") && ~isempty(obj.Ephemeris)
        satHandles(end + 1) = scatter(ax, obj.Ephemeris.LongitudeDeg(1), ...
            obj.Ephemeris.LatitudeDeg(1), 55, "filled", ...
            "MarkerFaceColor", obj.Color); %#ok<AGROW>
    end
end

handles = struct("Figure", fig, "Axes", ax, "Controller", controller, ...
    "SatelliteHandles", satHandles, "StationHandles", stationHandles);

if ~options.Play
    return;
end

frameCount = min(numel(timeVector), floor(options.MaxFrames));
for tIdx = 1:frameCount
    if ~isvalid(fig) || ~isvalid(ax)
        return;
    end
    hIdx = 1;
    for k = 1:numel(scenario.Objects)
        obj = scenario.Objects{k};
        if isa(obj, "SatelliteObject") && ~isempty(obj.Ephemeris)
            if hIdx > numel(satHandles) || ~isvalid(satHandles(hIdx))
                return;
            end
            satHandles(hIdx).XData = obj.Ephemeris.LongitudeDeg(tIdx);
            satHandles(hIdx).YData = obj.Ephemeris.LatitudeDeg(tIdx);
            hIdx = hIdx + 1;
        end
    end
    title(ax, "Scenario Animation - " + string(timeVector(tIdx)));
    drawnow;
    pause(options.PauseSeconds);
end
end

function options = parseAnimationOptions(varargin)
options = struct("ShowAccessLinks", true, ...
    "Play", true, ...
    "PauseSeconds", 0.05, ...
    "MaxFrames", inf, ...
    "ShowSensorBoresight", false, ...
    "ShowSensorFOV", false, ...
    "ShowSensorFOR", false, ...
    "ShowActiveTaskPointing", false, ...
    "ShowScheduledTargetLines", false, ...
    "SelectedSatelliteName", "", ...
    "SelectedSensorName", "");

if isempty(varargin)
    return;
end

if isscalar(varargin) && isstruct(varargin{1})
    incoming = varargin{1};
    names = fieldnames(incoming);
    for k = 1:numel(names)
        options = setAnimationOption(options, names{k}, incoming.(names{k}));
    end
else
    if mod(numel(varargin), 2) ~= 0
        error("animateScenario:InvalidOptions", ...
            "Options must be a struct or name-value pairs.");
    end
    for k = 1:2:numel(varargin)
        options = setAnimationOption(options, varargin{k}, varargin{k + 1});
    end
end

validateattributes(options.ShowAccessLinks, {'logical'}, {'scalar'});
validateattributes(options.Play, {'logical'}, {'scalar'});
validateattributes(options.PauseSeconds, {'numeric'}, {'scalar', 'nonnegative'});
validateattributes(options.MaxFrames, {'numeric'}, {'scalar', 'positive'});
validateattributes(options.ShowSensorBoresight, {'logical'}, {'scalar'});
validateattributes(options.ShowSensorFOV, {'logical'}, {'scalar'});
validateattributes(options.ShowSensorFOR, {'logical'}, {'scalar'});
validateattributes(options.ShowActiveTaskPointing, {'logical'}, {'scalar'});
validateattributes(options.ShowScheduledTargetLines, {'logical'}, {'scalar'});
end

function options = setAnimationOption(options, name, value)
name = char(string(name));
if ~isfield(options, name)
    error("animateScenario:UnknownOption", ...
        "Unknown animation option: %s.", name);
end
options.(name) = value;
end
