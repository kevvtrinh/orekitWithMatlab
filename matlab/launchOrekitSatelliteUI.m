function app = launchOrekitSatelliteUI()
%LAUNCHOREKITSATELLITEUI STK-style MATLAB front end for Orekit scenarios.

repoRoot = fileparts(fileparts(mfilename("fullpath")));
srcRoot = fullfile(repoRoot, "src");
if isfolder(srcRoot)
    addpath(genpath(srcRoot));
end

defaultJarRoot = fullfile(repoRoot, "vendor", "orekit", "lib");
defaultDataRoot = fullfile(repoRoot, "vendor", "orekit", "data", "orekit-data");

scenario = MissionScenario(defaultScenarioConfig());
selectedKind = "Scenario";
selectedName = "";
selectedParentName = "";
isConfigured = false;
lastAccessResult = [];

scenarioNameEdit = [];
epochEdit = [];
durationHoursEdit = [];
timeStepEdit = [];
animationStepEdit = [];
stopTimeValue = [];
scenarioTimeEdit = [];
timeSlider = [];
jarEdit = [];
dataEdit = [];
objectTree = [];
viewTabs = [];
mapTab = [];
globeTab = [];
sensorViewerTab = [];
mapAxes = [];
globeAxes = [];
sensorViewerAxes = [];
selectedLabel = [];
objectInfoText = [];
accessSourceDrop = [];
accessTargetDrop = [];
accessSummaryText = [];
statusLabel = [];
showTrackCheck = [];
showOrbitCheck = [];
showPlacesCheck = [];
frame3DDrop = [];
animationTimer = [];
sensorParentDrop = [];
sensorDrop = [];
sensorTargetDrop = [];
lastSensorAccessResult = [];
viewerSatelliteDrop = [];
viewerSensorDrop = [];
viewerShowBodyCheck = [];
viewerShowAxesCheck = [];
viewerShowMountsCheck = [];
viewerShowLabelsCheck = [];
viewerShowBoresightCheck = [];
viewerShowFOVCheck = [];
viewerShowFORCheck = [];
viewerFOVScaleEdit = [];
viewerFORScaleEdit = [];
taskTypeDrop = [];
taskTargetDrop = [];
taskSensorDrop = [];
taskPriorityEdit = [];
taskDwellEdit = [];
taskCoverageEdit = [];
coverageTargetDrop = [];
analysisSatelliteDrop = [];
analysisStationDrop = [];
showSensorFovCheck = [];
showSensorForCheck = [];
taskList = {};
lastTaskCandidates = [];
lastTaskConflicts = [];
lastTaskSchedule = [];

fig = uifigure("Name", "MATLAB Orekit Scenario", ...
    "Position", [70 70 1360 790]);
fig.CloseRequestFcn = @closeApp;

buildMenus();

root = uigridlayout(fig, [2 1]);
root.RowHeight = {156, "1x"};
root.ColumnWidth = {"1x"};
root.Padding = [8 8 8 8];
root.RowSpacing = 8;

ribbon = uitabgroup(root);
ribbon.Layout.Row = 1;
scenarioTab = uitab(ribbon, "Title", "Scenario");
insertTab = uitab(ribbon, "Title", "Insert");
viewTab = uitab(ribbon, "Title", "View");
targetTab = uitab(ribbon, "Title", "Targets");
areaTargetTab = uitab(ribbon, "Title", "Area Targets");
sensorTab = uitab(ribbon, "Title", "Sensors / Payloads");
sensorTaskTab = uitab(ribbon, "Title", "Sensor Tasks");
schedulingTab = uitab(ribbon, "Title", "Scheduling");
coverageTab = uitab(ribbon, "Title", "Coverage");
analysisTab = uitab(ribbon, "Title", "Analysis");
sensorViewerRibbonTab = uitab(ribbon, "Title", "Satellite / Sensor Viewer");
ribbon.SelectedTab = insertTab;

buildScenarioRibbon(scenarioTab);
buildInsertRibbon(insertTab);
buildViewRibbon(viewTab);
buildTargetsRibbon(targetTab);
buildAreaTargetsRibbon(areaTargetTab);
buildSensorsRibbon(sensorTab);
buildSensorTasksRibbon(sensorTaskTab);
buildSchedulingRibbon(schedulingTab);
buildCoverageRibbon(coverageTab);
buildAnalysisRibbon(analysisTab);
buildSensorViewerRibbon(sensorViewerRibbonTab);

main = uigridlayout(root, [1 3]);
main.Layout.Row = 2;
main.ColumnWidth = {280, "1x", 360};
main.RowHeight = {"1x"};
main.ColumnSpacing = 8;

buildObjectBrowser(main);
buildGraphicsArea(main);
buildPropertiesPanel(main);

app = struct("Figure", fig, ...
    "GetScenario", @getScenario, ...
    "Refresh", @refreshAll, ...
    "ConfigureOrekit", @configureOrekitCallback);

updateScenarioControls();
refreshAll();

    function buildMenus()
        scenarioMenu = uimenu(fig, "Text", "Scenario");
        uimenu(scenarioMenu, "Text", "Save Scenario...", ...
            "MenuSelectedFcn", @saveScenarioCallback);
        uimenu(scenarioMenu, "Text", "Load Scenario...", ...
            "MenuSelectedFcn", @loadScenarioCallback);
        uimenu(scenarioMenu, "Text", "Close Scenario", "Separator", "on", ...
            "MenuSelectedFcn", @closeScenarioCallback);

        insertMenu = uimenu(fig, "Text", "Insert");
        uimenu(insertMenu, "Text", "Satellite...", ...
            "MenuSelectedFcn", @openSatelliteDialog);
        uimenu(insertMenu, "Text", "Constellation...", ...
            "MenuSelectedFcn", @openConstellationDialog);
        uimenu(insertMenu, "Text", "Place...", ...
            "MenuSelectedFcn", @openPlaceDialog);
        uimenu(insertMenu, "Text", "Point Target...", ...
            "MenuSelectedFcn", @openTargetDialog);
        uimenu(insertMenu, "Text", "Area Target...", ...
            "MenuSelectedFcn", @openAreaTargetDialog);

        optionsMenu = uimenu(fig, "Text", "Options");
        uimenu(optionsMenu, "Text", "Configure Orekit", ...
            "MenuSelectedFcn", @configureOrekitCallback);
        uimenu(optionsMenu, "Text", "Refresh Visualization", ...
            "MenuSelectedFcn", @refreshViewsCallback);
        uimenu(optionsMenu, "Text", "Show Selected Over Earth", ...
            "MenuSelectedFcn", @focusSelectedObject);
    end

    function buildScenarioRibbon(parent)
        grid = uigridlayout(parent, [3 12]);
        grid.RowHeight = {34, 34, 34};
        grid.ColumnWidth = {70, 70, 70, 12, 80, 170, 74, 158, 74, 76, "1x", 118};
        grid.Padding = [10 8 10 6];
        grid.RowSpacing = 6;
        grid.ColumnSpacing = 8;

        btn = uibutton(grid, "Text", "Save", "ButtonPushedFcn", @saveScenarioCallback, ...
            "Tooltip", "Save the current scenario to a .mat file");
        btn.Layout.Row = 1;
        btn.Layout.Column = 1;
        btn = uibutton(grid, "Text", "Load", "ButtonPushedFcn", @loadScenarioCallback, ...
            "Tooltip", "Load a scenario from a .mat file (replaces the current one)");
        btn.Layout.Row = 1;
        btn.Layout.Column = 2;
        btn = uibutton(grid, "Text", "Close", "ButtonPushedFcn", @closeScenarioCallback, ...
            "Tooltip", "Clear all objects and reset to an empty scenario");
        btn.Layout.Row = 1;
        btn.Layout.Column = 3;

        lbl = uilabel(grid, "Text", "Name");
        lbl.Layout.Row = 1;
        lbl.Layout.Column = 5;
        scenarioNameEdit = uieditfield(grid, "text", ...
            "ValueChangedFcn", @applyScenarioConfigCallback, ...
            "Placeholder", "Scenario name", ...
            "Tooltip", "Display name for this scenario");
        scenarioNameEdit.Layout.Row = 1;
        scenarioNameEdit.Layout.Column = 6;

        lbl = uilabel(grid, "Text", "Epoch (UTC)");
        lbl.Layout.Row = 1;
        lbl.Layout.Column = 7;
        epochEdit = uieditfield(grid, "text", ...
            "ValueChangedFcn", @applyScenarioConfigCallback, ...
            "Placeholder", "2026-01-01T00:00:00", ...
            "Tooltip", "Scenario start time in UTC, e.g. 2026-01-01T00:00:00");
        epochEdit.Layout.Row = 1;
        epochEdit.Layout.Column = 8;

        lbl = uilabel(grid, "Text", "Duration (h)");
        lbl.Layout.Row = 1;
        lbl.Layout.Column = 9;
        durationHoursEdit = uieditfield(grid, "numeric", ...
            "Limits", [0.001 Inf], "ValueChangedFcn", @applyScenarioConfigCallback, ...
            "Tooltip", "Propagation span in hours, measured from the epoch");
        durationHoursEdit.Layout.Row = 1;
        durationHoursEdit.Layout.Column = 10;

        propagateButton = uibutton(grid, "Text", "Apply / Propagate", ...
            "ButtonPushedFcn", @applyScenarioConfigCallback, ...
            "Tooltip", "Apply these settings and re-propagate all satellites");
        propagateButton.Layout.Row = [1 2];
        propagateButton.Layout.Column = 12;

        lbl = uilabel(grid, "Text", "Step (s)");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 5;
        timeStepEdit = uieditfield(grid, "numeric", ...
            "Limits", [0.001 Inf], "ValueChangedFcn", @applyScenarioConfigCallback, ...
            "Tooltip", "Ephemeris output step in seconds (smaller = smoother, slower)");
        timeStepEdit.Layout.Row = 2;
        timeStepEdit.Layout.Column = 6;

        lbl = uilabel(grid, "Text", "Stop (UTC)");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 7;
        stopTimeValue = uilabel(grid, "Text", "", ...
            "Tooltip", "Scenario end time (epoch + duration); computed automatically");
        stopTimeValue.Layout.Row = 2;
        stopTimeValue.Layout.Column = 8;

        lbl = uilabel(grid, "Text", "Scenario (UTC)");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 9;
        scenarioTimeEdit = uieditfield(grid, "text", ...
            "ValueChangedFcn", @scenarioTimeChanged, ...
            "Placeholder", "2026-01-01T00:00:00", ...
            "Tooltip", "Current display time (UTC). Type a time or drag the timeline slider");
        scenarioTimeEdit.Layout.Row = 2;
        scenarioTimeEdit.Layout.Column = [10 11];

        lbl = uilabel(grid, "Text", "JAR folder");
        lbl.Layout.Row = 3;
        lbl.Layout.Column = 1;
        jarEdit = uieditfield(grid, "text", "Value", defaultJarRoot, ...
            "Tooltip", "Folder containing the Orekit/Hipparchus .jar files");
        jarEdit.Layout.Row = 3;
        jarEdit.Layout.Column = [2 6];
        btn = uibutton(grid, "Text", "Browse", "ButtonPushedFcn", @browseJarRoot, ...
            "Tooltip", "Choose the folder containing the Orekit .jar files");
        btn.Layout.Row = 3;
        btn.Layout.Column = 7;

        lbl = uilabel(grid, "Text", "Data");
        lbl.Layout.Row = 3;
        lbl.Layout.Column = 8;
        dataEdit = uieditfield(grid, "text", "Value", defaultDataRoot, ...
            "Tooltip", "Orekit data folder (Earth orientation, leap seconds, ephemerides)");
        dataEdit.Layout.Row = 3;
        dataEdit.Layout.Column = [9 10];
        btn = uibutton(grid, "Text", "Browse", "ButtonPushedFcn", @browseDataRoot, ...
            "Tooltip", "Choose the orekit-data folder");
        btn.Layout.Row = 3;
        btn.Layout.Column = 11;
        btn = uibutton(grid, "Text", "Configure", ...
            "ButtonPushedFcn", @configureOrekitCallback, ...
            "Tooltip", "Start the Java/Orekit runtime using the folders above");
        btn.Layout.Row = 3;
        btn.Layout.Column = 12;
    end

    function buildInsertRibbon(parent)
        grid = uigridlayout(parent, [2 11]);
        grid.RowHeight = {56, 22};
        grid.ColumnWidth = {112, 112, 126, 16, 118, 118, 118, 16, 118, "1x", 118};
        grid.Padding = [10 8 10 6];
        grid.ColumnSpacing = 8;

        btn = uibutton(grid, "Text", "Satellite", ...
            "ButtonPushedFcn", @openSatelliteDialog, ...
            "Tooltip", "Add a satellite from Keplerian elements or a TLE");
        btn.Layout.Row = 1;
        btn.Layout.Column = 1;
        lbl = uilabel(grid, "Text", "Orbit object", ...
            "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 1;

        btn = uibutton(grid, "Text", "Place", ...
            "ButtonPushedFcn", @openPlaceDialog, ...
            "Tooltip", "Add a fixed ground location (latitude/longitude/altitude)");
        btn.Layout.Row = 1;
        btn.Layout.Column = 2;
        lbl = uilabel(grid, "Text", "Earth object", ...
            "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Constellation", ...
            "ButtonPushedFcn", @openConstellationDialog, ...
            "Tooltip", "Add a group of satellites in a Walker-style pattern");
        btn.Layout.Row = 1;
        btn.Layout.Column = 3;
        lbl = uilabel(grid, "Text", "Orbit group", ...
            "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 3;

        btn = uibutton(grid, "Text", "Propagate", ...
            "ButtonPushedFcn", @propagateScenarioCallback, ...
            "Tooltip", "Propagate all satellites over the scenario span");
        btn.Layout.Row = 1;
        btn.Layout.Column = 5;

        btn = uibutton(grid, "Text", "Access", ...
            "ButtonPushedFcn", @computeAccessCallback, ...
            "Tooltip", "Compute access intervals for the Source/Target in the Properties panel");
        btn.Layout.Row = 1;
        btn.Layout.Column = 6;

        btn = uibutton(grid, "Text", "Focus", ...
            "ButtonPushedFcn", @focusSelectedObject, ...
            "Tooltip", "Center the 3D view on the selected object");
        btn.Layout.Row = 1;
        btn.Layout.Column = 7;

        btn = uibutton(grid, "Text", "Export", ...
            "ButtonPushedFcn", @exportToWorkspace, ...
            "Tooltip", "Export the scenario to a variable in the MATLAB workspace");
        btn.Layout.Row = 1;
        btn.Layout.Column = 9;

        btn = uibutton(grid, "Text", "Configure", ...
            "ButtonPushedFcn", @configureOrekitCallback, ...
            "Tooltip", "Start the Java/Orekit runtime (required before propagating)");
        btn.Layout.Row = 1;
        btn.Layout.Column = 11;
    end

    function buildViewRibbon(parent)
        grid = uigridlayout(parent, [2 15]);
        grid.RowHeight = {56, 22};
        grid.ColumnWidth = {102, 102, 90, 14, 112, 92, 76, 96, 82, 82, 82, 96, 104, 92, "1x"};
        grid.Padding = [10 8 10 6];
        grid.ColumnSpacing = 8;

        btn = uibutton(grid, "Text", "2D Window", ...
            "ButtonPushedFcn", @(~, ~) selectView(mapTab), ...
            "Tooltip", "Show the 2D ground-track map");
        btn.Layout.Row = 1;
        btn.Layout.Column = 1;

        btn = uibutton(grid, "Text", "3D Window", ...
            "ButtonPushedFcn", @(~, ~) selectView(globeTab), ...
            "Tooltip", "Show the 3D Earth view");
        btn.Layout.Row = 1;
        btn.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Refresh", ...
            "ButtonPushedFcn", @refreshViewsCallback, ...
            "Tooltip", "Redraw the 2D and 3D views from the current ephemeris");
        btn.Layout.Row = 1;
        btn.Layout.Column = 3;

        showTrackCheck = uicheckbox(grid, "Text", "Ground tracks", ...
            "Value", true, "ValueChangedFcn", @refreshViewsCallback, ...
            "Tooltip", "Draw sub-satellite ground tracks on the 2D map");
        showTrackCheck.Layout.Row = 1;
        showTrackCheck.Layout.Column = 5;

        showOrbitCheck = uicheckbox(grid, "Text", "3D paths", ...
            "Value", true, "ValueChangedFcn", @refreshViewsCallback, ...
            "Tooltip", "Draw orbit trajectories in the 3D view");
        showOrbitCheck.Layout.Row = 1;
        showOrbitCheck.Layout.Column = 6;

        showPlacesCheck = uicheckbox(grid, "Text", "Places", ...
            "Value", true, "ValueChangedFcn", @refreshViewsCallback, ...
            "Tooltip", "Draw places, targets, and ground stations");
        showPlacesCheck.Layout.Row = 1;
        showPlacesCheck.Layout.Column = 7;

        showSensorFovCheck = uicheckbox(grid, "Text", "Sensor FOV", ...
            "Value", false, "ValueChangedFcn", @refreshViewsCallback, ...
            "Tooltip", "Project the instantaneous sensor field-of-view footprint at the current scenario time");
        showSensorFovCheck.Layout.Row = 2;
        showSensorFovCheck.Layout.Column = 5;

        showSensorForCheck = uicheckbox(grid, "Text", "Sensor FOR", ...
            "Value", false, "ValueChangedFcn", @refreshViewsCallback, ...
            "Tooltip", "Project the sensor field-of-regard footprint (full envelope reachable by slewing)");
        showSensorForCheck.Layout.Row = 2;
        showSensorForCheck.Layout.Column = 6;

        frame3DDrop = uidropdown(grid, "Items", {'ECEF', 'ECI'}, ...
            "Value", "ECEF", "ValueChangedFcn", @refreshViewsCallback, ...
            "Tooltip", "3D display frame: ECEF (Earth-fixed) or ECI (inertial)");
        frame3DDrop.Layout.Row = 1;
        frame3DDrop.Layout.Column = 8;
        frameLabel = uilabel(grid, "Text", "3D frame", ...
            "HorizontalAlignment", "center");
        frameLabel.Layout.Row = 2;
        frameLabel.Layout.Column = 8;

        btn = uibutton(grid, "Text", "Start", ...
            "ButtonPushedFcn", @startAnimation, ...
            "Tooltip", "Play the scenario clock forward at the animation step");
        btn.Layout.Row = 1;
        btn.Layout.Column = 9;

        btn = uibutton(grid, "Text", "Stop", ...
            "ButtonPushedFcn", @stopAnimation, ...
            "Tooltip", "Pause the animation at the current scenario time");
        btn.Layout.Row = 1;
        btn.Layout.Column = 10;

        btn = uibutton(grid, "Text", "Reset", ...
            "ButtonPushedFcn", @resetAnimation, ...
            "Tooltip", "Stop the animation and reset scenario time to the epoch");
        btn.Layout.Row = 1;
        btn.Layout.Column = 11;

        btn = uibutton(grid, "Text", "Step Back", ...
            "ButtonPushedFcn", @(~, ~) stepScenarioTime(-1), ...
            "Tooltip", "Step scenario time backward by one animation step");
        btn.Layout.Row = 1;
        btn.Layout.Column = 12;

        btn = uibutton(grid, "Text", "Step Forward", ...
            "ButtonPushedFcn", @(~, ~) stepScenarioTime(1), ...
            "Tooltip", "Step scenario time forward by one animation step");
        btn.Layout.Row = 1;
        btn.Layout.Column = 13;

        animationStepEdit = uieditfield(grid, "numeric", ...
            "Value", seconds(scenario.Config.AnimationStep), ...
            "Limits", [0.001 Inf], ...
            "ValueChangedFcn", @animationStepChanged, ...
            "Tooltip", "Scenario seconds advanced per animation frame");
        animationStepEdit.Layout.Row = 1;
        animationStepEdit.Layout.Column = 14;
        lbl = uilabel(grid, "Text", "Anim step (s)", ...
            "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 14;
    end

    function buildSensorsRibbon(parent)
        grid = uigridlayout(parent, [2 12]);
        grid.RowHeight = {56, 22};
        grid.ColumnWidth = {150, 150, 150, 14, 104, 104, 126, 112, 112, 112, "1x", 116};
        grid.Padding = [10 8 10 6];
        grid.ColumnSpacing = 8;

        sensorParentDrop = uidropdown(grid, "Items", {'<none>'}, ...
            "ValueChangedFcn", @sensorParentChanged, ...
            "Tooltip", "Satellite or ground object the sensor is mounted on");
        sensorParentDrop.Layout.Row = 1;
        sensorParentDrop.Layout.Column = 1;
        lbl = uilabel(grid, "Text", "Parent object", ...
            "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 1;

        sensorDrop = uidropdown(grid, "Items", {'<none>'}, ...
            "Tooltip", "Sensor on the parent object to analyze or delete");
        sensorDrop.Layout.Row = 1;
        sensorDrop.Layout.Column = 2;
        lbl = uilabel(grid, "Text", "Sensor", ...
            "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 2;

        sensorTargetDrop = uidropdown(grid, "Items", {'<none>'}, ...
            "Tooltip", "Object the sensor observes for access computation");
        sensorTargetDrop.Layout.Row = 1;
        sensorTargetDrop.Layout.Column = 3;
        lbl = uilabel(grid, "Text", "Target object", ...
            "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 3;

        btn = uibutton(grid, "Text", "Add Sensor", ...
            "ButtonPushedFcn", @openSensorDialog, ...
            "Tooltip", "Define a new sensor (shape, half-angles, mount, range) on a parent object");
        btn.Layout.Row = 1;
        btn.Layout.Column = 5;

        btn = uibutton(grid, "Text", "Delete", ...
            "ButtonPushedFcn", @deleteSensorCallback, ...
            "Tooltip", "Remove the selected sensor from its parent object");
        btn.Layout.Row = 1;
        btn.Layout.Column = 6;

        btn = uibutton(grid, "Text", "Compute Access", ...
            "ButtonPushedFcn", @computeSensorAccessCallback, ...
            "Tooltip", "Compute windows where the target is inside the sensor's pointing and range limits");
        btn.Layout.Row = 1;
        btn.Layout.Column = 7;

        btn = uibutton(grid, "Text", "Timeline", ...
            "ButtonPushedFcn", @plotSensorTimelineCallback, ...
            "Tooltip", "Plot access windows from the last sensor access computation");
        btn.Layout.Row = 1;
        btn.Layout.Column = 8;

        btn = uibutton(grid, "Text", "Off-Boresight", ...
            "ButtonPushedFcn", @plotOffBoresightCallback, ...
            "Tooltip", "Plot target angle from the sensor boresight vs. time (last computed access)");
        btn.Layout.Row = 1;
        btn.Layout.Column = 9;

        btn = uibutton(grid, "Text", "Range", ...
            "ButtonPushedFcn", @plotSensorRangeCallback, ...
            "Tooltip", "Plot sensor-to-target range vs. time (last computed access)");
        btn.Layout.Row = 1;
        btn.Layout.Column = 10;

        btn = uibutton(grid, "Text", "Export Report", ...
            "ButtonPushedFcn", @exportSensorAccessCallback, ...
            "Tooltip", "Write the last sensor access result to a CSV report");
        btn.Layout.Row = 1;
        btn.Layout.Column = 12;
    end

    function buildTargetsRibbon(parent)
        grid = uigridlayout(parent, [2 8]);
        grid.RowHeight = {56, 22};
        grid.ColumnWidth = {128, 128, 128, 16, 128, 128, "1x", 116};
        grid.Padding = [10 8 10 6];
        grid.ColumnSpacing = 8;

        btn = uibutton(grid, "Text", "Point Target", ...
            "ButtonPushedFcn", @openTargetDialog, ...
            "Tooltip", "Add a fixed ground target (latitude/longitude/altitude)");
        btn.Layout.Row = 1;
        btn.Layout.Column = 1;
        lbl = uilabel(grid, "Text", "Fixed point", "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 1;

        btn = uibutton(grid, "Text", "Delete", ...
            "ButtonPushedFcn", @deleteSelectedObject, ...
            "Tooltip", "Remove the object selected in the Object Browser");
        btn.Layout.Row = 1;
        btn.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Focus", ...
            "ButtonPushedFcn", @focusSelectedObject, ...
            "Tooltip", "Center the 3D view on the selected object");
        btn.Layout.Row = 1;
        btn.Layout.Column = 3;

        btn = uibutton(grid, "Text", "Compute Access", ...
            "ButtonPushedFcn", @computeAccessCallback, ...
            "Tooltip", "Compute access for the Source/Target pair set in the Properties panel");
        btn.Layout.Row = 1;
        btn.Layout.Column = 5;
    end

    function buildAreaTargetsRibbon(parent)
        grid = uigridlayout(parent, [2 9]);
        grid.RowHeight = {56, 22};
        grid.ColumnWidth = {128, 128, 128, 16, 128, 128, "1x", 116, 116};
        grid.Padding = [10 8 10 6];
        grid.ColumnSpacing = 8;

        btn = uibutton(grid, "Text", "Polygon Area", ...
            "ButtonPushedFcn", @openAreaTargetDialog, ...
            "Tooltip", "Add a polygon area target defined by latitude/longitude vertices");
        btn.Layout.Row = 1;
        btn.Layout.Column = 1;
        lbl = uilabel(grid, "Text", "Grid target", "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 1;

        btn = uibutton(grid, "Text", "Plot Area", ...
            "ButtonPushedFcn", @plotSelectedAreaTargetCallback, ...
            "Tooltip", "Draw the selected area target and its grid points in the 2D window");
        btn.Layout.Row = 1;
        btn.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Focus", ...
            "ButtonPushedFcn", @focusSelectedObject, ...
            "Tooltip", "Center the 3D view on the selected object");
        btn.Layout.Row = 1;
        btn.Layout.Column = 3;

        btn = uibutton(grid, "Text", "Generate Grid", ...
            "ButtonPushedFcn", @generateSelectedAreaGridCallback, ...
            "Tooltip", "Sample the selected polygon into coverage grid points at its grid resolution");
        btn.Layout.Row = 1;
        btn.Layout.Column = 5;
    end

    function buildSensorTasksRibbon(parent)
        grid = uigridlayout(parent, [2 13]);
        grid.RowHeight = {56, 22};
        grid.ColumnWidth = {142, 142, 142, 74, 74, 86, 16, 118, 118, 118, "1x", 118, 118};
        grid.Padding = [10 8 10 6];
        grid.ColumnSpacing = 8;

        taskTypeDrop = uidropdown(grid, "Items", ...
            {'TrackPointTarget', 'ScanAreaTarget', 'MultiSensorTrackPointTarget', 'MultiSensorScanAreaTarget'}, ...
            "Value", "TrackPointTarget", ...
            "Tooltip", "Observation type; MultiSensor variants require two sensors");
        taskTypeDrop.Layout.Row = 1;
        taskTypeDrop.Layout.Column = 1;
        lbl = uilabel(grid, "Text", "Task type", "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 1;

        taskTargetDrop = uidropdown(grid, "Items", {'<none>'}, ...
            "Tooltip", "Point or area target this task must observe");
        taskTargetDrop.Layout.Row = 1;
        taskTargetDrop.Layout.Column = 2;
        lbl = uilabel(grid, "Text", "Target", "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 2;

        taskSensorDrop = uidropdown(grid, "Items", {'<any>'}, ...
            "Tooltip", "Restrict the task to one sensor, or <any> to let the scheduler choose");
        taskSensorDrop.Layout.Row = 1;
        taskSensorDrop.Layout.Column = 3;
        lbl = uilabel(grid, "Text", "Allowed sensor", "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 3;

        taskPriorityEdit = uieditfield(grid, "numeric", "Value", 5, "Limits", [0 Inf], ...
            "Tooltip", "Task priority; higher values are scheduled first");
        taskPriorityEdit.Layout.Row = 1;
        taskPriorityEdit.Layout.Column = 4;
        lbl = uilabel(grid, "Text", "Priority", "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 4;

        taskDwellEdit = uieditfield(grid, "numeric", "Value", 120, "Limits", [0 Inf], ...
            "Tooltip", "Minimum continuous observation time required, in seconds");
        taskDwellEdit.Layout.Row = 1;
        taskDwellEdit.Layout.Column = 5;
        lbl = uilabel(grid, "Text", "Dwell (s)", "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 5;

        taskCoverageEdit = uieditfield(grid, "numeric", "Value", 25, "Limits", [0 100], ...
            "Tooltip", "Minimum percent of the area target that must be covered (area-scan tasks)");
        taskCoverageEdit.Layout.Row = 1;
        taskCoverageEdit.Layout.Column = 6;
        lbl = uilabel(grid, "Text", "Coverage %", "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 6;

        btn = uibutton(grid, "Text", "Add Task", ...
            "ButtonPushedFcn", @addSensorTaskCallback, ...
            "Tooltip", "Add this tasking request to the task list");
        btn.Layout.Row = 1;
        btn.Layout.Column = 8;

        btn = uibutton(grid, "Text", "Clear Tasks", ...
            "ButtonPushedFcn", @clearSensorTasksCallback, ...
            "Tooltip", "Remove all tasks, candidates, conflicts, and the schedule");
        btn.Layout.Row = 1;
        btn.Layout.Column = 9;

        btn = uibutton(grid, "Text", "Generate", ...
            "ButtonPushedFcn", @generateTaskCandidatesCallback, ...
            "Tooltip", "Compute candidate observation windows for every task (field-of-regard gated)");
        btn.Layout.Row = 1;
        btn.Layout.Column = 10;

        btn = uibutton(grid, "Text", "Schedule", ...
            "ButtonPushedFcn", @runGreedySchedulerCallback, ...
            "Tooltip", "Run the greedy scheduler (priority, then quality) over the candidates");
        btn.Layout.Row = 1;
        btn.Layout.Column = 12;
    end

    function buildSchedulingRibbon(parent)
        grid = uigridlayout(parent, [2 9]);
        grid.RowHeight = {56, 22};
        grid.ColumnWidth = {142, 142, 142, 142, 142, 16, "1x", 128, 128};
        grid.Padding = [10 8 10 6];
        grid.ColumnSpacing = 8;

        btn = uibutton(grid, "Text", "Generate Candidates", ...
            "ButtonPushedFcn", @generateTaskCandidatesCallback, ...
            "Tooltip", "Compute candidate observation windows for every sensor task");
        btn.Layout.Row = 1;
        btn.Layout.Column = 1;

        btn = uibutton(grid, "Text", "Detect Conflicts", ...
            "ButtonPushedFcn", @detectTaskConflictsCallback, ...
            "Tooltip", "Find candidate pairs that overlap or violate slew/transition gaps");
        btn.Layout.Row = 1;
        btn.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Greedy Schedule", ...
            "ButtonPushedFcn", @runGreedySchedulerCallback, ...
            "Tooltip", "Build a conflict-free schedule, taking higher-priority candidates first");
        btn.Layout.Row = 1;
        btn.Layout.Column = 3;

        btn = uibutton(grid, "Text", "Timeline", ...
            "ButtonPushedFcn", @plotTaskTimelineCallback, ...
            "Tooltip", "Plot the scheduled tasks per sensor over time");
        btn.Layout.Row = 1;
        btn.Layout.Column = 4;

        btn = uibutton(grid, "Text", "Export MILP", ...
            "ButtonPushedFcn", @exportMilpInputsCallback, ...
            "Tooltip", "Write candidates, conflicts, and tasks as CSV inputs for an external MILP solver");
        btn.Layout.Row = 1;
        btn.Layout.Column = 5;
    end

    function buildCoverageRibbon(parent)
        grid = uigridlayout(parent, [2 8]);
        grid.RowHeight = {56, 22};
        grid.ColumnWidth = {180, 128, 128, 16, 128, "1x", 128, 128};
        grid.Padding = [10 8 10 6];
        grid.ColumnSpacing = 8;

        coverageTargetDrop = uidropdown(grid, "Items", {'<none>'}, ...
            "Tooltip", "Area target whose polygon and grid to display");
        coverageTargetDrop.Layout.Row = 1;
        coverageTargetDrop.Layout.Column = 1;
        lbl = uilabel(grid, "Text", "Area target", "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 1;

        btn = uibutton(grid, "Text", "Plot Area", ...
            "ButtonPushedFcn", @plotCoverageCallback, ...
            "Tooltip", "Draw the area target and its grid points in the 2D window");
        btn.Layout.Row = 1;
        btn.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Timeline", ...
            "ButtonPushedFcn", @plotTaskTimelineCallback, ...
            "Tooltip", "Plot the scheduled tasks per sensor over time");
        btn.Layout.Row = 1;
        btn.Layout.Column = 3;
    end

    function buildAnalysisRibbon(parent)
        grid = uigridlayout(parent, [3 8]);
        grid.RowHeight = {34, 34, 34};
        grid.ColumnWidth = {70, 180, 12, 140, 140, 140, 140, "1x"};
        grid.Padding = [10 8 10 6];
        grid.RowSpacing = 6;
        grid.ColumnSpacing = 8;

        lbl = uilabel(grid, "Text", "Satellite");
        lbl.Layout.Row = 1;
        lbl.Layout.Column = 1;
        analysisSatelliteDrop = uidropdown(grid, "Items", {'<none>'}, ...
            "Tooltip", "Satellite used by Eclipse Timeline, Orbital Elements, and Export OEM");
        analysisSatelliteDrop.Layout.Row = 1;
        analysisSatelliteDrop.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Eclipse Timeline", ...
            "ButtonPushedFcn", @eclipseTimelineCallback, ...
            "Tooltip", "Plot umbra/penumbra/sunlight intervals for the selected satellite");
        btn.Layout.Row = 1;
        btn.Layout.Column = 4;
        btn = uibutton(grid, "Text", "Orbital Elements", ...
            "ButtonPushedFcn", @orbitalElementsCallback, ...
            "Tooltip", "Plot osculating element history over the scenario span");
        btn.Layout.Row = 1;
        btn.Layout.Column = 5;
        btn = uibutton(grid, "Text", "Export OEM...", ...
            "ButtonPushedFcn", @exportOemCallback, ...
            "Tooltip", "Write the selected satellite's ephemeris to a CCSDS OEM file");
        btn.Layout.Row = 1;
        btn.Layout.Column = 6;

        lbl = uilabel(grid, "Text", "Station");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 1;
        analysisStationDrop = uidropdown(grid, "Items", {'<none>'}, ...
            "Tooltip", "Ground station used by Deck Access");
        analysisStationDrop.Layout.Row = 2;
        analysisStationDrop.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Deck Access", ...
            "ButtonPushedFcn", @deckAccessCallback, ...
            "Tooltip", "Tabulate access windows from the selected station to every satellite");
        btn.Layout.Row = 2;
        btn.Layout.Column = 4;
        btn = uibutton(grid, "Text", "Global Coverage", ...
            "ButtonPushedFcn", @globalCoverageCallback, ...
            "Tooltip", "Map constellation coverage on a global 6-deg grid (5-deg min elevation)");
        btn.Layout.Row = 2;
        btn.Layout.Column = 5;
    end

    function name = requireAnalysisSatellite()
        name = string(analysisSatelliteDrop.Value);
        if name == "<none>"
            error("OrekitUI:NoSatelliteSelected", ...
                "Add a satellite and choose it in the Analysis tab first.");
        end
    end

    function ensurePropagatedForAnalysis(progress, startValue, endValue)
        applyScenarioConfig();
        requireConfigured();
        if hasSatellites() && anySatellitesNeedPropagation()
            propagateScenarioInternal(progress, startValue, endValue);
        end
    end

    function eclipseTimelineCallback(~, ~)
        progress = [];
        try
            progress = openProgress("Eclipse Analysis", "Preparing scenario...", 0.05);
            ensurePropagatedForAnalysis(progress, 0.15, 0.55);
            satName = requireAnalysisSatellite();
            updateProgress(progress, 0.65, "Computing eclipse intervals...");
            eclipse = computeEclipse(scenario, satName);
            updateProgress(progress, 0.90, "Plotting lighting timeline...");
            plotEclipseTimeline(eclipse);
            finishProgress(progress, "Eclipse analysis complete.");
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Eclipse analysis failed");
        end
    end

    function orbitalElementsCallback(~, ~)
        progress = [];
        try
            progress = openProgress("Orbital Elements", "Preparing scenario...", 0.05);
            ensurePropagatedForAnalysis(progress, 0.15, 0.55);
            satName = requireAnalysisSatellite();
            updateProgress(progress, 0.65, "Computing osculating elements...");
            elements = computeOrbitalElements(scenario, satName);
            updateProgress(progress, 0.90, "Plotting element history...");
            plotOrbitalElements(elements, satName);
            finishProgress(progress, "Element report complete.");
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Element report failed");
        end
    end

    function exportOemCallback(~, ~)
        progress = [];
        try
            satName = requireAnalysisSatellite();
            [file, folder] = uiputfile("*.oem", "Export OEM Ephemeris", ...
                char(satName + ".oem"));
            if isequal(file, 0)
                return;
            end
            progress = openProgress("Export OEM", "Preparing scenario...", 0.05);
            ensurePropagatedForAnalysis(progress, 0.15, 0.65);
            updateProgress(progress, 0.80, "Writing CCSDS OEM file...");
            exportOEM(scenario, satName, fullfile(folder, file));
            finishProgress(progress, "OEM export complete.");
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "OEM export failed");
        end
    end

    function deckAccessCallback(~, ~)
        progress = [];
        try
            progress = openProgress("Deck Access", "Preparing scenario...", 0.05);
            ensurePropagatedForAnalysis(progress, 0.15, 0.55);
            stationName = string(analysisStationDrop.Value);
            if stationName == "<none>"
                error("OrekitUI:NoStationSelected", ...
                    "Add a ground station and choose it in the Analysis tab first.");
            end
            updateProgress(progress, 0.65, "Computing deck access...");
            deck = computeDeckAccess(scenario, stationName);
            finishProgress(progress, "Deck access complete.");

            resultFig = uifigure("Name", "Deck Access - " + stationName, ...
                "Position", [220 160 820 420]);
            resultGrid = uigridlayout(resultFig, [1 1]);
            resultGrid.Padding = [8 8 8 8];
            uitable(resultGrid, "Data", deck.AccessWindows);
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Deck access failed");
        end
    end

    function globalCoverageCallback(~, ~)
        progress = [];
        try
            progress = openProgress("Global Coverage", "Preparing scenario...", 0.05);
            ensurePropagatedForAnalysis(progress, 0.15, 0.55);
            updateProgress(progress, 0.60, "Computing coverage grid (this can take a moment)...");
            coverage = computeCoverage(scenario, CoverageGrid.globalGrid(6), ...
                struct("MinElevationDeg", 5));
            updateProgress(progress, 0.90, "Plotting coverage map...");
            plotCoverageMap(coverage, "CoveragePercent");
            finishProgress(progress, "Coverage analysis complete.");
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Coverage analysis failed");
        end
    end

    function buildSensorViewerRibbon(parent)
        grid = uigridlayout(parent, [2 14]);
        grid.RowHeight = {56, 22};
        grid.ColumnWidth = {142, 142, 92, 92, 92, 92, 92, 92, 70, 70, 16, 118, 118, "1x"};
        grid.Padding = [10 8 10 6];
        grid.ColumnSpacing = 8;

        viewerSatelliteDrop = uidropdown(grid, "Items", {'<none>'}, ...
            "ValueChangedFcn", @viewerSatelliteChanged, ...
            "Tooltip", "Satellite whose body and sensors to draw");
        viewerSatelliteDrop.Layout.Row = 1;
        viewerSatelliteDrop.Layout.Column = 1;
        lbl = uilabel(grid, "Text", "Satellite", "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 1;

        viewerSensorDrop = uidropdown(grid, "Items", {'<all>'}, ...
            "Tooltip", "Draw one sensor, or <all> for every sensor on the satellite");
        viewerSensorDrop.Layout.Row = 1;
        viewerSensorDrop.Layout.Column = 2;
        lbl = uilabel(grid, "Text", "Sensor", "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 2;

        viewerShowBodyCheck = uicheckbox(grid, "Text", "Body", "Value", true);
        viewerShowBodyCheck.Layout.Row = 1;
        viewerShowBodyCheck.Layout.Column = 3;
        viewerShowAxesCheck = uicheckbox(grid, "Text", "Axes", "Value", true);
        viewerShowAxesCheck.Layout.Row = 1;
        viewerShowAxesCheck.Layout.Column = 4;
        viewerShowMountsCheck = uicheckbox(grid, "Text", "Mounts", "Value", true);
        viewerShowMountsCheck.Layout.Row = 1;
        viewerShowMountsCheck.Layout.Column = 5;
        viewerShowLabelsCheck = uicheckbox(grid, "Text", "Labels", "Value", true);
        viewerShowLabelsCheck.Layout.Row = 1;
        viewerShowLabelsCheck.Layout.Column = 6;
        viewerShowBoresightCheck = uicheckbox(grid, "Text", "Boresight", "Value", true);
        viewerShowBoresightCheck.Layout.Row = 1;
        viewerShowBoresightCheck.Layout.Column = 7;
        viewerShowFOVCheck = uicheckbox(grid, "Text", "FOV", "Value", true, ...
            "Tooltip", "Draw the instantaneous field-of-view cone");
        viewerShowFOVCheck.Layout.Row = 1;
        viewerShowFOVCheck.Layout.Column = 8;

        viewerShowFORCheck = uicheckbox(grid, "Text", "FOR", "Value", false, ...
            "Tooltip", "Draw the field-of-regard envelope (full range reachable by slewing)");
        viewerShowFORCheck.Layout.Row = 1;
        viewerShowFORCheck.Layout.Column = 9;
        viewerFOVScaleEdit = uieditfield(grid, "numeric", "Value", 1.5, "Limits", [0.1 Inf], ...
            "Tooltip", "Drawn FOV cone length relative to the body size (display only)");
        viewerFOVScaleEdit.Layout.Row = 1;
        viewerFOVScaleEdit.Layout.Column = 10;
        lbl = uilabel(grid, "Text", "FOV scale", "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 10;
        viewerFORScaleEdit = uieditfield(grid, "numeric", "Value", 2.5, "Limits", [0.1 Inf], ...
            "Tooltip", "Drawn FOR envelope length relative to the body size (display only)");
        viewerFORScaleEdit.Layout.Row = 1;
        viewerFORScaleEdit.Layout.Column = 12;
        lbl = uilabel(grid, "Text", "FOR scale", "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 12;

        btn = uibutton(grid, "Text", "Refresh Viewer", ...
            "ButtonPushedFcn", @refreshSensorViewerCallback, ...
            "Tooltip", "Redraw the satellite/sensor view with the options above");
        btn.Layout.Row = 1;
        btn.Layout.Column = 13;
    end

    function buildObjectBrowser(parent)
        panel = uipanel(parent, "Title", "Object Browser");
        panel.Layout.Column = 1;
        grid = uigridlayout(panel, [2 1]);
        grid.RowHeight = {"1x", 34};
        grid.Padding = [8 8 8 8];

        objectTree = uitree(grid);
        objectTree.Layout.Row = 1;
        objectTree.SelectionChangedFcn = @onObjectSelected;

        btn = uibutton(grid, "Text", "Delete Selected", ...
            "ButtonPushedFcn", @deleteSelectedObject, ...
            "Tooltip", "Remove the object selected in the tree from the scenario");
        btn.Layout.Row = 2;
    end

    function buildGraphicsArea(parent)
        viewTabs = uitabgroup(parent);
        viewTabs.Layout.Column = 2;
        mapTab = uitab(viewTabs, "Title", "2D Graphics");
        globeTab = uitab(viewTabs, "Title", "3D Graphics");
        sensorViewerTab = uitab(viewTabs, "Title", "Satellite / Sensor Viewer");
        viewTabs.SelectedTab = mapTab;

        grid = uigridlayout(mapTab, [2 1]);
        grid.RowHeight = {"1x", 34};
        grid.Padding = [4 4 4 4];
        mapAxes = uiaxes(grid);
        mapAxes.Layout.Row = 1;
        timeSlider = uislider(grid, "ValueChangedFcn", @timeSliderChanged, ...
            "Tooltip", "Scenario time: seconds past the epoch (drag to scrub)");
        timeSlider.Layout.Row = 2;

        grid = uigridlayout(globeTab, [1 1]);
        grid.Padding = [4 4 4 4];
        globeAxes = uiaxes(grid);

        grid = uigridlayout(sensorViewerTab, [1 1]);
        grid.Padding = [4 4 4 4];
        sensorViewerAxes = uiaxes(grid);
    end

    function buildPropertiesPanel(parent)
        panel = uipanel(parent, "Title", "Properties");
        panel.Layout.Column = 3;
        grid = uigridlayout(panel, [11 2]);
        grid.RowHeight = {28, "1x", 24, 30, 30, 34, 24, 110, 34, 34, 28};
        grid.ColumnWidth = {92, "1x"};
        grid.Padding = [10 8 10 8];
        grid.RowSpacing = 7;

        selectedLabel = uilabel(grid, "Text", "Scenario", "FontWeight", "bold");
        selectedLabel.Layout.Row = 1;
        selectedLabel.Layout.Column = [1 2];

        objectInfoText = uitextarea(grid, "Editable", "off", ...
            "Value", {'Select an object in the browser to view its properties.'});
        objectInfoText.Layout.Row = 2;
        objectInfoText.Layout.Column = [1 2];

        lbl = uilabel(grid, "Text", "Access", "FontWeight", "bold");
        lbl.Layout.Row = 3;
        lbl.Layout.Column = [1 2];

        lbl = uilabel(grid, "Text", "Source");
        lbl.Layout.Row = 4;
        lbl.Layout.Column = 1;
        accessSourceDrop = uidropdown(grid, "Items", {'<none>'}, ...
            "Tooltip", "Observing object (usually a satellite or sensor)");
        accessSourceDrop.Layout.Row = 4;
        accessSourceDrop.Layout.Column = 2;

        lbl = uilabel(grid, "Text", "Target");
        lbl.Layout.Row = 5;
        lbl.Layout.Column = 1;
        accessTargetDrop = uidropdown(grid, "Items", {'<none>'}, ...
            "Tooltip", "Object being observed (place, target, or satellite)");
        accessTargetDrop.Layout.Row = 5;
        accessTargetDrop.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Compute Access", ...
            "ButtonPushedFcn", @computeAccessCallback, ...
            "Tooltip", "Find line-of-sight windows between Source and Target");
        btn.Layout.Row = 6;
        btn.Layout.Column = [1 2];

        lbl = uilabel(grid, "Text", "Results", "FontWeight", "bold");
        lbl.Layout.Row = 7;
        lbl.Layout.Column = [1 2];

        accessSummaryText = uitextarea(grid, "Editable", "off", ...
            "Value", {'Choose a Source and Target, then Compute Access.'});
        accessSummaryText.Layout.Row = 8;
        accessSummaryText.Layout.Column = [1 2];

        btn = uibutton(grid, "Text", "Export Scenario To Workspace", ...
            "ButtonPushedFcn", @exportToWorkspace, ...
            "Tooltip", "Export the scenario to a variable in the MATLAB workspace");
        btn.Layout.Row = 9;
        btn.Layout.Column = [1 2];

        btn = uibutton(grid, "Text", "Export Ephemeris CSVs", ...
            "ButtonPushedFcn", @exportEphemerisCallback, ...
            "Tooltip", "Write per-satellite ephemeris (time, position, velocity) to CSV files");
        btn.Layout.Row = 10;
        btn.Layout.Column = [1 2];

        statusLabel = uilabel(grid, "Text", "Orekit not configured - click Configure", ...
            "FontColor", [0.55 0.18 0.08], ...
            "Tooltip", "Runtime and last-action status");
        statusLabel.Layout.Row = 11;
        statusLabel.Layout.Column = [1 2];
    end

    function cfg = defaultScenarioConfig()
        cfg = ScenarioConfig("Name", "Untitled Scenario", ...
            "Epoch", datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC"), ...
            "Duration", hours(24), ...
            "TimeStep", seconds(60), ...
            "AnimationStep", seconds(10), ...
            "OutputFrame", "GCRF");
    end

    function currentScenario = getScenario()
        currentScenario = scenario;
    end

    function browseJarRoot(~, ~)
        chosen = uigetdir(jarEdit.Value, "Select folder containing Orekit JAR files");
        if ischar(chosen) || isstring(chosen)
            jarEdit.Value = char(chosen);
            isConfigured = false;
            setStatus("Orekit path changed", [0.55 0.18 0.08]);
        end
    end

    function browseDataRoot(~, ~)
        chosen = uigetdir(dataEdit.Value, "Select unzipped orekit-data folder");
        if ischar(chosen) || isstring(chosen)
            dataEdit.Value = char(chosen);
            isConfigured = false;
            setStatus("Orekit data path changed", [0.55 0.18 0.08]);
        end
    end

    function configureOrekitCallback(~, ~)
        try
            configureOrekit();
        catch err
            setStatus("Orekit configuration failed", [0.55 0.18 0.08]);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Orekit configuration failed");
        end
    end

    function status = configureOrekit()
        setStatus("Configuring Orekit...", [0.35 0.35 0.35]);
        drawnow;
        status = OrekitInitializer.initialize(jarEdit.Value, dataEdit.Value);
        isConfigured = true;
        setStatus(sprintf("Configured: %d JARs added, %d providers", ...
            status.JarsAdded, status.DataProviders), [0.10 0.42 0.14]);
    end

    function requireConfigured()
        if ~isConfigured
            configureOrekit();
        end
    end

    function applyScenarioConfigCallback(~, ~)
        try
            stopAnimationTimerOnly();
            applyScenarioConfig();
            if hasSatellites()
                propagateScenarioInternal();
            else
                refreshAll();
            end
        catch err
            setStatus("Scenario update failed", [0.55 0.18 0.08]);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Scenario update failed");
            updateScenarioControls();
        end
    end

    function propagateScenarioCallback(~, ~)
        try
            stopAnimationTimerOnly();
            applyScenarioConfig();
            propagateScenarioInternal();
        catch err
            setStatus("Propagation failed", [0.55 0.18 0.08]);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Propagation failed");
        end
    end

    function applyScenarioConfig()
        cfg = buildConfigFromControls();
        scenario.Config = cfg;
        scenario.CurrentAnimationTime = currentScenarioTimeFromControl(cfg);
        updateScenarioControls();
    end

    function cfg = buildConfigFromControls()
        epoch = parseUtcDatetime(epochEdit.Value);
        durationHours = durationHoursEdit.Value;
        stepSeconds = timeStepEdit.Value;
        animationStepSeconds = seconds(scenario.Config.AnimationStep);
        if ~isempty(animationStepEdit) && isvalid(animationStepEdit)
            animationStepSeconds = animationStepEdit.Value;
        end
        if durationHours <= 0 || stepSeconds <= 0 || animationStepSeconds <= 0
            error("OrekitUI:InvalidScenarioTime", ...
                "Duration, time step, and animation step must be positive.");
        end

        name = string(strtrim(scenarioNameEdit.Value));
        if strlength(name) == 0
            error("OrekitUI:InvalidScenarioName", "Scenario name cannot be empty.");
        end

        cfg = ScenarioConfig("Name", name, ...
            "Epoch", epoch, ...
            "Duration", hours(durationHours), ...
            "TimeStep", seconds(stepSeconds), ...
            "AnimationStep", seconds(animationStepSeconds), ...
            "OutputFrame", "GCRF");
        cfg.validate();
    end

    function animationStepChanged(~, ~)
        try
            if animationStepEdit.Value <= 0
                error("OrekitUI:InvalidAnimationStep", ...
                    "Animation step must be positive.");
            end
            cfg = scenario.Config;
            cfg.AnimationStep = seconds(animationStepEdit.Value);
            cfg.validate();
            scenario.Config = cfg;
            updateScenarioControls();
            setStatus("Animation step updated", [0.10 0.42 0.14]);
        catch err
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Animation step update failed");
            updateScenarioControls();
        end
    end

    function time = currentScenarioTimeFromControl(cfg)
        try
            time = parseUtcDatetime(scenarioTimeEdit.Value);
        catch
            time = scenario.CurrentAnimationTime;
        end
        time = clampScenarioTime(time, cfg);
    end

    function propagateScenarioInternal(progress, startValue, endValue)
        if nargin < 1
            progress = [];
        end
        if nargin < 2
            startValue = 0.05;
        end
        if nargin < 3
            endValue = 0.95;
        end
        ownProgress = isempty(progress);
        if ownProgress
            progress = openProgress("Propagate Scenario", ...
                "Preparing propagation...", startValue);
        end

        try
        if ~hasSatellites()
            updateProgress(progress, endValue, "No satellites to propagate.");
            refreshAll();
            if ownProgress
                finishProgress(progress, "No satellites to propagate.");
            end
            return;
        end

        updateProgress(progress, progressValue(startValue, endValue, 0.15), ...
            "Checking Orekit runtime...");
        requireConfigured();
        updateProgress(progress, progressValue(startValue, endValue, 0.35), ...
            sprintf("Propagating %d satellite(s)...", satelliteCount()));
        scenario = scenario.propagate();
        updateProgress(progress, progressValue(startValue, endValue, 0.85), ...
            "Updating 2D and 3D views...");
        setStatus(sprintf("Propagated %d satellite(s) over %s", ...
            satelliteCount(), scenarioDurationLabel()), [0.10 0.42 0.14]);
        refreshAll();
        if ownProgress
            finishProgress(progress, "Propagation complete.");
        end
        catch err
            if ownProgress
                closeProgress(progress);
            end
            rethrow(err);
        end
    end

    function scenarioTimeChanged(~, ~)
        try
            scenario.CurrentAnimationTime = clampScenarioTime( ...
                parseUtcDatetime(scenarioTimeEdit.Value), scenario.Config);
            updateScenarioControls();
            refreshAll();
        catch err
            uialert(fig, getReport(err, "basic", "hyperlinks", "off"), ...
                "Invalid scenario time");
            updateScenarioControls();
        end
    end

    function timeSliderChanged(~, event)
        cfg = scenario.Config;
        offsetSeconds = event.Value;
        scenario.CurrentAnimationTime = clampScenarioTime( ...
            cfg.Epoch + seconds(offsetSeconds), cfg);
        updateScenarioControls();
        refreshAll();
    end

    function stepScenarioTime(direction)
        stopAnimationTimerOnly();
        cfg = scenario.Config;
        scenario.CurrentAnimationTime = clampScenarioTime( ...
            scenario.CurrentAnimationTime + direction * cfg.AnimationStep, cfg);
        updateScenarioControls();
        refreshAll();
    end

    function startAnimation(~, ~)
        try
            stopAnimationTimerOnly();
            applyScenarioConfig();
            if hasSatellites() && anySatellitesNeedPropagation()
                propagateScenarioInternal();
            end
            scenario.CurrentAnimationTime = scenario.Config.Epoch;
            updateScenarioControls();
            refreshAll();
            ensureAnimationTimer();
            start(animationTimer);
            setStatus("Animating scenario...", [0.10 0.32 0.58]);
        catch err
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Animation failed");
        end
    end

    function stopAnimation(~, ~)
        stopAnimationTimerOnly();
        setStatus("Animation stopped", [0.35 0.35 0.35]);
    end

    function resetAnimation(~, ~)
        stopAnimationTimerOnly();
        scenario.CurrentAnimationTime = scenario.Config.Epoch;
        updateScenarioControls();
        refreshAll();
        setStatus("Animation reset to scenario epoch", [0.35 0.35 0.35]);
    end

    function ensureAnimationTimer()
        if isempty(animationTimer) || ~isvalid(animationTimer)
            animationTimer = timer("ExecutionMode", "fixedRate", ...
                "Period", 0.08, "BusyMode", "drop", ...
                "TimerFcn", @animationTick);
        end
    end

    function animationTick(~, ~)
        try
            if isempty(fig) || ~isvalid(fig)
                stopAnimationTimerOnly();
                return;
            end

            cfg = scenario.Config;
            stopTime = cfg.getStopTime();
            nextTime = scenario.CurrentAnimationTime + cfg.AnimationStep;
            if nextTime >= stopTime
                scenario.CurrentAnimationTime = stopTime;
                updateScenarioControls();
                refreshVisualization();
                stopAnimationTimerOnly();
                setStatus("Animation complete", [0.10 0.42 0.14]);
                drawnow limitrate;
                return;
            end

            scenario.CurrentAnimationTime = nextTime;
            updateScenarioControls();
            refreshVisualization();
            drawnow limitrate;
        catch
            stopAnimationTimerOnly();
            setStatus("Animation stopped after an update error", [0.65 0.08 0.08]);
        end
    end

    function stopAnimationTimerOnly()
        if ~isempty(animationTimer) && isvalid(animationTimer) ...
                && strcmp(animationTimer.Running, "on")
            stop(animationTimer);
        end
    end

    function deleteAnimationTimer()
        if ~isempty(animationTimer) && isvalid(animationTimer)
            stopAnimationTimerOnly();
            delete(animationTimer);
        end
        animationTimer = [];
    end

    function openSatelliteDialog(~, ~)
        dialog = uifigure("Name", "Insert Satellite", ...
            "Position", [180 130 560 520]);
        dialogGrid = uigridlayout(dialog, [1 1]);
        dialogGrid.Padding = [10 10 10 10];
        typeTabs = uitabgroup(dialogGrid);

        kepTab = uitab(typeTabs, "Title", "Keplerian");
        kepGrid = uigridlayout(kepTab, [10 2]);
        kepGrid.RowHeight = repmat({34}, 1, 10);
        kepGrid.ColumnWidth = {170, "1x"};
        kepGrid.Padding = [12 12 12 12];
        kepGrid.RowSpacing = 7;

        uilabel(kepGrid, "Text", "Name");
        kepName = uieditfield(kepGrid, "text", "Value", nextObjectName("Satellite"));
        kepName.Layout.Row = 1;
        kepName.Layout.Column = 2;

        uilabel(kepGrid, "Text", "Semi-major axis (km)");
        kepSma = uieditfield(kepGrid, "numeric", "Value", 7000, "Limits", [0 Inf], ...
            "Tooltip", "From Earth's center, not altitude (Earth radius is about 6378 km)");
        kepSma.Layout.Row = 2;
        kepSma.Layout.Column = 2;

        uilabel(kepGrid, "Text", "Eccentricity");
        kepEcc = uieditfield(kepGrid, "numeric", "Value", 0.001, ...
            "Limits", [0 0.999999]);
        kepEcc.Layout.Row = 3;
        kepEcc.Layout.Column = 2;

        uilabel(kepGrid, "Text", "Inclination (deg)");
        kepInc = uieditfield(kepGrid, "numeric", "Value", 51.6);
        kepInc.Layout.Row = 4;
        kepInc.Layout.Column = 2;

        uilabel(kepGrid, "Text", "RAAN (deg)");
        kepRaan = uieditfield(kepGrid, "numeric", "Value", 0, ...
            "Tooltip", "Right ascension of the ascending node");
        kepRaan.Layout.Row = 5;
        kepRaan.Layout.Column = 2;

        uilabel(kepGrid, "Text", "Arg. of perigee (deg)");
        kepArgPerigee = uieditfield(kepGrid, "numeric", "Value", 0);
        kepArgPerigee.Layout.Row = 6;
        kepArgPerigee.Layout.Column = 2;

        uilabel(kepGrid, "Text", "True anomaly (deg)");
        kepTrueAnomaly = uieditfield(kepGrid, "numeric", "Value", 0, ...
            "Tooltip", "Position in the orbit at the scenario epoch");
        kepTrueAnomaly.Layout.Row = 7;
        kepTrueAnomaly.Layout.Column = 2;

        uilabel(kepGrid, "Text", "Mass (kg)");
        kepMass = uieditfield(kepGrid, "numeric", "Value", 1000, "Limits", [0 Inf]);
        kepMass.Layout.Row = 8;
        kepMass.Layout.Column = 2;

        uilabel(kepGrid, "Text", "Propagator");
        kepPropagator = uidropdown(kepGrid, ...
            "Items", {'Keplerian (two-body)', 'Eckstein-Hechler (J2-J6)', 'Numerical (HPOP)'}, ...
            "ItemsData", {'Keplerian', 'EcksteinHechler', 'Numerical'}, ...
            "Value", 'Keplerian', ...
            "Tooltip", "Force-model fidelity: two-body analytic, zonal-harmonic analytic, or numerical integration");
        kepPropagator.Layout.Row = 9;
        kepPropagator.Layout.Column = 2;

        btn = uibutton(kepGrid, "Text", "Insert Satellite", ...
            "ButtonPushedFcn", @insertKeplerianSatellite);
        btn.Layout.Row = 10;
        btn.Layout.Column = [1 2];

        tleTab = uitab(typeTabs, "Title", "TLE");
        tleGrid = uigridlayout(tleTab, [8 2]);
        tleGrid.RowHeight = {34, 24, 92, 24, 92, 34, 36, "1x"};
        tleGrid.ColumnWidth = {88, "1x"};
        tleGrid.Padding = [12 12 12 12];

        uilabel(tleGrid, "Text", "Name");
        tleName = uieditfield(tleGrid, "text", "Value", "ISS");
        tleName.Layout.Row = 1;
        tleName.Layout.Column = 2;

        lbl = uilabel(tleGrid, "Text", "Line 1");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = [1 2];
        tleLine1 = uitextarea(tleGrid, "Value", ...
            '1 25544U 98067A   24183.51782528  .00016717  00000+0  30403-3 0  9995');
        tleLine1.Layout.Row = 3;
        tleLine1.Layout.Column = [1 2];

        lbl = uilabel(tleGrid, "Text", "Line 2");
        lbl.Layout.Row = 4;
        lbl.Layout.Column = [1 2];
        tleLine2 = uitextarea(tleGrid, "Value", ...
            '2 25544  51.6416 197.2432 0007782 103.9422 356.9484 15.49376197459965');
        tleLine2.Layout.Row = 5;
        tleLine2.Layout.Column = [1 2];

        lbl = uilabel(tleGrid, "Text", "Propagator");
        lbl.Layout.Row = 6;
        lbl.Layout.Column = 1;
        tlePropagator = uidropdown(tleGrid, ...
            "Items", {'SGP4 (TLE)', 'Numerical (HPOP, seeded from TLE)'}, ...
            "ItemsData", {'TLE', 'Numerical'}, ...
            "Value", 'TLE', ...
            "Tooltip", "The TLE carries its own epoch; the state is evaluated over the scenario span");
        tlePropagator.Layout.Row = 6;
        tlePropagator.Layout.Column = 2;

        btn = uibutton(tleGrid, "Text", "Insert Satellite", ...
            "ButtonPushedFcn", @insertTleSatellite);
        btn.Layout.Row = 7;
        btn.Layout.Column = [1 2];

        function insertKeplerianSatellite(~, ~)
            progress = [];
            try
                progress = openProgress("Insert Satellite", ...
                    "Reading Keplerian satellite inputs...", 0.05);
                updateProgress(progress, 0.15, "Applying scenario settings...");
                applyScenarioConfig();
                updateProgress(progress, 0.25, "Checking Orekit runtime...");
                requireConfigured();
                updateProgress(progress, 0.35, "Creating satellite object...");
                name = cleanObjectName(kepName.Value);
                assertUniqueObjectName(name);
                sat = SatelliteObject.fromKeplerian(name, kepSma.Value * 1000.0, ...
                    kepEcc.Value, kepInc.Value, kepRaan.Value, ...
                    kepArgPerigee.Value, kepTrueAnomaly.Value);
                sat.MassKg = kepMass.Value;
                sat.PropagatorType = string(kepPropagator.Value);
                scenario = scenario.addObject(sat);
                selectedKind = "Satellite";
                selectedName = string(name);
                delete(dialog);
                updateProgress(progress, 0.50, "Propagating satellite...");
                propagateScenarioInternal(progress, 0.50, 0.95);
                finishProgress(progress, "Satellite inserted.");
            catch err
                closeProgress(progress);
                uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                    "Could not insert satellite");
            end
        end

        function insertTleSatellite(~, ~)
            progress = [];
            try
                progress = openProgress("Insert Satellite", ...
                    "Reading TLE satellite inputs...", 0.05);
                updateProgress(progress, 0.15, "Applying scenario settings...");
                applyScenarioConfig();
                updateProgress(progress, 0.25, "Checking Orekit runtime...");
                requireConfigured();
                updateProgress(progress, 0.35, "Creating TLE satellite object...");
                name = cleanObjectName(tleName.Value);
                assertUniqueObjectName(name);
                sat = SatelliteObject.fromTLE(name, ...
                    cleanTextareaValue(tleLine1.Value), ...
                    cleanTextareaValue(tleLine2.Value));
                sat.PropagatorType = string(tlePropagator.Value);
                scenario = scenario.addObject(sat);
                selectedKind = "Satellite";
                selectedName = string(name);
                delete(dialog);
                updateProgress(progress, 0.50, "Propagating satellite...");
                propagateScenarioInternal(progress, 0.50, 0.95);
                finishProgress(progress, "Satellite inserted.");
            catch err
                closeProgress(progress);
                uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                    "Could not insert satellite");
            end
        end
    end

    function openConstellationDialog(~, ~)
        dialog = uifigure("Name", "Insert Constellation", ...
            "Position", [230 120 500 520]);
        grid = uigridlayout(dialog, [13 2]);
        grid.RowHeight = [{34}, repmat({32}, 1, 10), {38, "1x"}];
        grid.ColumnWidth = {170, "1x"};
        grid.Padding = [12 12 12 12];
        grid.RowSpacing = 7;

        uilabel(grid, "Text", "Pattern");
        patternDrop = uidropdown(grid, "Items", {'Walker Delta', 'Walker Star'}, ...
            "Value", "Walker Delta");
        patternDrop.Layout.Row = 1;
        patternDrop.Layout.Column = 2;

        uilabel(grid, "Text", "Name prefix");
        prefixEdit = uieditfield(grid, "text", "Value", nextObjectName("Walker"));
        prefixEdit.Layout.Row = 2;
        prefixEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Total satellites");
        totalEdit = uieditfield(grid, "numeric", "Value", 12, "Limits", [1 Inf], ...
            "RoundFractionalValues", "on");
        totalEdit.Layout.Row = 3;
        totalEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Planes");
        planesEdit = uieditfield(grid, "numeric", "Value", 3, "Limits", [1 Inf], ...
            "RoundFractionalValues", "on");
        planesEdit.Layout.Row = 4;
        planesEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Phasing");
        phasingEdit = uieditfield(grid, "numeric", "Value", 1, "Limits", [0 Inf], ...
            "RoundFractionalValues", "on");
        phasingEdit.Layout.Row = 5;
        phasingEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Semi-major axis (km)");
        smaEdit = uieditfield(grid, "numeric", "Value", 7000, "Limits", [0 Inf]);
        smaEdit.Layout.Row = 6;
        smaEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Eccentricity");
        eccEdit = uieditfield(grid, "numeric", "Value", 0.001, ...
            "Limits", [0 0.999999]);
        eccEdit.Layout.Row = 7;
        eccEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Inclination (deg)");
        incEdit = uieditfield(grid, "numeric", "Value", 53);
        incEdit.Layout.Row = 8;
        incEdit.Layout.Column = 2;

        uilabel(grid, "Text", "RAAN offset (deg)");
        raanOffsetEdit = uieditfield(grid, "numeric", "Value", 0);
        raanOffsetEdit.Layout.Row = 9;
        raanOffsetEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Arg. of perigee (deg)");
        argPerigeeEdit = uieditfield(grid, "numeric", "Value", 0);
        argPerigeeEdit.Layout.Row = 10;
        argPerigeeEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Anomaly offset (deg)");
        anomalyOffsetEdit = uieditfield(grid, "numeric", "Value", 0);
        anomalyOffsetEdit.Layout.Row = 11;
        anomalyOffsetEdit.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Insert Constellation", ...
            "ButtonPushedFcn", @insertConstellation);
        btn.Layout.Row = 12;
        btn.Layout.Column = [1 2];

        function insertConstellation(~, ~)
            progress = [];
            try
                progress = openProgress("Insert Constellation", ...
                    "Reading constellation inputs...", 0.05);
                updateProgress(progress, 0.12, "Applying scenario settings...");
                applyScenarioConfig();
                updateProgress(progress, 0.20, "Checking Orekit runtime...");
                requireConfigured();
                updateProgress(progress, 0.30, "Generating Walker constellation...");
                prefix = cleanObjectName(prefixEdit.Value);
                pattern = string(patternDrop.Value);
                totalSatellites = totalEdit.Value;
                planes = planesEdit.Value;
                phasing = phasingEdit.Value;

                if pattern == "Walker Star"
                    satellites = ConstellationFactory.walkerStar(prefix, ...
                        totalSatellites, planes, phasing, smaEdit.Value * 1000.0, ...
                        incEdit.Value, "Eccentricity", eccEdit.Value, ...
                        "RAANOffsetDeg", raanOffsetEdit.Value, ...
                        "ArgPerigeeDeg", argPerigeeEdit.Value, ...
                        "TrueAnomalyOffsetDeg", anomalyOffsetEdit.Value);
                else
                    satellites = ConstellationFactory.walkerDelta(prefix, ...
                        totalSatellites, planes, phasing, smaEdit.Value * 1000.0, ...
                        incEdit.Value, "Eccentricity", eccEdit.Value, ...
                        "RAANOffsetDeg", raanOffsetEdit.Value, ...
                        "ArgPerigeeDeg", argPerigeeEdit.Value, ...
                        "TrueAnomalyOffsetDeg", anomalyOffsetEdit.Value);
                end

                updateProgress(progress, 0.42, "Checking generated satellite names...");
                assertUniqueGeneratedNames(satellites);
                updateProgress(progress, 0.50, ...
                    sprintf("Adding %d constellation member(s)...", numel(satellites)));
                scenario = ConstellationFactory.addToScenario(scenario, satellites);
                selectedKind = "Satellite";
                selectedName = satellites{1}.Name;
                delete(dialog);
                updateProgress(progress, 0.58, "Propagating constellation...");
                propagateScenarioInternal(progress, 0.58, 0.97);
                finishProgress(progress, "Constellation inserted.");
            catch err
                closeProgress(progress);
                uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                    "Could not insert constellation");
            end
        end
    end

    function openPlaceDialog(~, ~)
        dialog = uifigure("Name", "Insert Place", "Position", [220 170 420 300]);
        grid = uigridlayout(dialog, [6 2]);
        grid.RowHeight = {34, 34, 34, 34, 34, 38};
        grid.ColumnWidth = {140, "1x"};
        grid.Padding = [12 12 12 12];
        grid.RowSpacing = 7;

        uilabel(grid, "Text", "Name");
        nameEdit = uieditfield(grid, "text", "Value", nextObjectName("Place"));
        nameEdit.Layout.Row = 1;
        nameEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Latitude (deg)");
        latEdit = uieditfield(grid, "numeric", "Value", 38.8339, "Limits", [-90 90]);
        latEdit.Layout.Row = 2;
        latEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Longitude (deg)");
        lonEdit = uieditfield(grid, "numeric", "Value", -104.8214, "Limits", [-180 180]);
        lonEdit.Layout.Row = 3;
        lonEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Altitude (km)");
        altEdit = uieditfield(grid, "numeric", "Value", 1.84);
        altEdit.Layout.Row = 4;
        altEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Min elevation (deg)");
        minElEdit = uieditfield(grid, "numeric", "Value", 5, "Limits", [-90 90]);
        minElEdit.Layout.Row = 5;
        minElEdit.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Insert Place", "ButtonPushedFcn", @insertPlace);
        btn.Layout.Row = 6;
        btn.Layout.Column = [1 2];

        function insertPlace(~, ~)
            progress = [];
            try
                progress = openProgress("Insert Place", ...
                    "Reading place inputs...", 0.10);
                updateProgress(progress, 0.25, "Applying scenario settings...");
                applyScenarioConfig();
                updateProgress(progress, 0.50, "Creating place object...");
                name = cleanObjectName(nameEdit.Value);
                assertUniqueObjectName(name);
                place = GroundStationObject(name, latEdit.Value, lonEdit.Value, ...
                    altEdit.Value * 1000.0, minElEdit.Value);
                updateProgress(progress, 0.70, "Adding place to scenario...");
                scenario = scenario.addObject(place);
                selectedKind = "GroundStation";
                selectedName = string(name);
                delete(dialog);
                updateProgress(progress, 0.90, "Updating object browser and views...");
                refreshAll();
                finishProgress(progress, "Place inserted.");
            catch err
                closeProgress(progress);
                uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                    "Could not insert place");
            end
        end
    end

    function openTargetDialog(~, ~)
        dialog = uifigure("Name", "Insert Point Target", "Position", [240 180 420 300]);
        grid = uigridlayout(dialog, [6 2]);
        grid.RowHeight = {34, 34, 34, 34, 34, 38};
        grid.ColumnWidth = {140, "1x"};
        grid.Padding = [12 12 12 12];
        grid.RowSpacing = 7;

        uilabel(grid, "Text", "Name");
        nameEdit = uieditfield(grid, "text", "Value", nextObjectName("Target"));
        nameEdit.Layout.Row = 1;
        nameEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Latitude (deg)");
        latEdit = uieditfield(grid, "numeric", "Value", 39.7392, "Limits", [-90 90]);
        latEdit.Layout.Row = 2;
        latEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Longitude (deg)");
        lonEdit = uieditfield(grid, "numeric", "Value", -104.9903, "Limits", [-180 180]);
        lonEdit.Layout.Row = 3;
        lonEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Altitude (km)");
        altEdit = uieditfield(grid, "numeric", "Value", 1.609);
        altEdit.Layout.Row = 4;
        altEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Priority");
        priorityEdit = uieditfield(grid, "numeric", "Value", 5, "Limits", [0 Inf]);
        priorityEdit.Layout.Row = 5;
        priorityEdit.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Insert Point Target", ...
            "ButtonPushedFcn", @insertTarget);
        btn.Layout.Row = 6;
        btn.Layout.Column = [1 2];

        function insertTarget(~, ~)
            progress = [];
            try
                progress = openProgress("Insert Point Target", ...
                    "Reading target inputs...", 0.10);
                applyScenarioConfig();
                updateProgress(progress, 0.45, "Creating target object...");
                name = cleanObjectName(nameEdit.Value);
                assertUniqueObjectName(name);
                target = TargetObject(name, latEdit.Value, lonEdit.Value, altEdit.Value * 1000.0);
                target.Priority = priorityEdit.Value;
                scenario = scenario.addObject(target);
                selectedKind = "Target";
                selectedName = string(name);
                delete(dialog);
                updateProgress(progress, 0.85, "Updating object browser and task controls...");
                refreshAll();
                finishProgress(progress, "Point target inserted.");
            catch err
                closeProgress(progress);
                uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                    "Could not insert point target");
            end
        end
    end

    function openAreaTargetDialog(~, ~)
        dialog = uifigure("Name", "Insert Area Target", "Position", [240 130 500 430]);
        grid = uigridlayout(dialog, [8 2]);
        grid.RowHeight = {34, 34, 34, 96, 34, 34, 34, 38};
        grid.ColumnWidth = {160, "1x"};
        grid.Padding = [12 12 12 12];
        grid.RowSpacing = 7;

        uilabel(grid, "Text", "Name");
        nameEdit = uieditfield(grid, "text", "Value", nextObjectName("AreaTarget"));
        nameEdit.Layout.Row = 1;
        nameEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Boundary lat (deg)");
        latText = uitextarea(grid, "Value", {'39.25,39.25,40.10,40.10'});
        latText.Layout.Row = 2;
        latText.Layout.Column = 2;

        uilabel(grid, "Text", "Boundary lon (deg)");
        lonText = uitextarea(grid, "Value", {'-105.45,-104.45,-104.45,-105.45'});
        lonText.Layout.Row = 3;
        lonText.Layout.Column = 2;

        uilabel(grid, "Text", "Grid resolution (km)");
        gridResolutionEdit = uieditfield(grid, "numeric", "Value", 35, "Limits", [0.1 Inf]);
        gridResolutionEdit.Layout.Row = 5;
        gridResolutionEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Required coverage %");
        coverageEdit = uieditfield(grid, "numeric", "Value", 30, "Limits", [0 100]);
        coverageEdit.Layout.Row = 6;
        coverageEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Altitude (km)");
        altEdit = uieditfield(grid, "numeric", "Value", 0);
        altEdit.Layout.Row = 7;
        altEdit.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Insert Area Target", ...
            "ButtonPushedFcn", @insertAreaTarget);
        btn.Layout.Row = 8;
        btn.Layout.Column = [1 2];

        function insertAreaTarget(~, ~)
            progress = [];
            try
                progress = openProgress("Insert Area Target", ...
                    "Reading polygon inputs...", 0.10);
                applyScenarioConfig();
                updateProgress(progress, 0.35, "Creating area target object...");
                name = cleanObjectName(nameEdit.Value);
                assertUniqueObjectName(name);
                lat = parseNumericVector(cleanTextareaValue(latText.Value), numel(split(cleanTextareaValue(latText.Value), ",")));
                lon = parseNumericVector(cleanTextareaValue(lonText.Value), numel(split(cleanTextareaValue(lonText.Value), ",")));
                if numel(lat) ~= numel(lon) || numel(lat) < 3
                    error("OrekitUI:InvalidAreaBoundary", ...
                        "Area target boundaries need matching latitude/longitude vectors with at least three vertices.");
                end
                area = AreaTargetObject(name, lat(:), lon(:), altEdit.Value * 1000.0);
                area.GridResolutionKm = gridResolutionEdit.Value;
                area.RequiredCoveragePercent = coverageEdit.Value;
                updateProgress(progress, 0.65, "Generating area grid...");
                area.GridPoints = area.generateGrid();
                scenario = scenario.addObject(area);
                selectedKind = "AreaTarget";
                selectedName = string(name);
                delete(dialog);
                updateProgress(progress, 0.90, "Updating object browser and coverage controls...");
                refreshAll();
                finishProgress(progress, "Area target inserted.");
            catch err
                closeProgress(progress);
                uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                    "Could not insert area target");
            end
        end
    end

    function openSensorDialog(~, ~)
        parentName = string(sensorParentDrop.Value);
        if parentName == "<none>" || strlength(parentName) == 0
            uialert(fig, "Add a satellite or place first, then choose it as the sensor parent.", ...
                "No sensor parent selected");
            return;
        end

        dialog = uifigure("Name", "Add Sensor", "Position", [260 90 500 620]);
        grid = uigridlayout(dialog, [15 2]);
        grid.RowHeight = [{34}, repmat({32}, 1, 13), {38}];
        grid.ColumnWidth = {160, "1x"};
        grid.Padding = [12 12 12 12];
        grid.RowSpacing = 7;

        uilabel(grid, "Text", "Parent");
        parentLabel = uilabel(grid, "Text", char(parentName), "FontWeight", "bold");
        parentLabel.Layout.Row = 1;
        parentLabel.Layout.Column = 2;

        uilabel(grid, "Text", "Sensor name");
        nameEdit = uieditfield(grid, "text", "Value", nextSensorName(parentName, "Sensor"));
        nameEdit.Layout.Row = 2;
        nameEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Sensor type");
        typeDrop = uidropdown(grid, "Items", ...
            {'SimpleConic', 'Rectangular', 'FixedVector', 'Targeted'}, ...
            "Value", "SimpleConic", ...
            "Tooltip", "Field-of-view shape: circular cone, rectangular pyramid, body-fixed cone, or target-tracking cone");
        typeDrop.Layout.Row = 3;
        typeDrop.Layout.Column = 2;

        uilabel(grid, "Text", "Pointing mode");
        pointingDrop = uidropdown(grid, "Items", ...
            {'Nadir', 'Mounted', 'FixedVector', 'Targeted', 'VelocityVector'}, ...
            "Value", "Nadir", ...
            "Tooltip", "Boresight direction: nadir, gimbal mount (az/el below), fixed body vector, tracking a target, or along-velocity");
        pointingDrop.Layout.Row = 4;
        pointingDrop.Layout.Column = 2;

        uilabel(grid, "Text", "Targeted at");
        targetDrop = uidropdown(grid, "Items", objectItemsOrNone(), ...
            "Tooltip", "Object the boresight tracks (Targeted type/pointing only)");
        targetDrop.Layout.Row = 5;
        targetDrop.Layout.Column = 2;

        uilabel(grid, "Text", "Cone half-angle (deg)");
        coneEdit = uieditfield(grid, "numeric", "Value", 20, "Limits", [0 180]);
        coneEdit.Layout.Row = 6;
        coneEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Rect half-angle X (deg)");
        rectXEdit = uieditfield(grid, "numeric", "Value", 10, "Limits", [0 180]);
        rectXEdit.Layout.Row = 7;
        rectXEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Rect half-angle Y (deg)");
        rectYEdit = uieditfield(grid, "numeric", "Value", 10, "Limits", [0 180]);
        rectYEdit.Layout.Row = 8;
        rectYEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Boresight ENU/XYZ");
        boresightEdit = uieditfield(grid, "text", "Value", "0,0,1", ...
            "Tooltip", "Boresight unit vector: body XYZ on satellites, ENU on ground objects (FixedVector only)");
        boresightEdit.Layout.Row = 9;
        boresightEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Range min/max (km)");
        rangeEdit = uieditfield(grid, "text", "Value", "0,Inf", ...
            "Tooltip", "Sensor-to-target range limits in km, e.g. 0,2500 (Inf = unlimited)");
        rangeEdit.Layout.Row = 10;
        rangeEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Min elevation (deg)");
        minElEdit = uieditfield(grid, "numeric", "Value", 0, "Limits", [-90 90], ...
            "Tooltip", "Minimum elevation of the target above the sensor's local horizon");
        minElEdit.Layout.Row = 11;
        minElEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Mount az/el (deg)");
        mountAzElEdit = uieditfield(grid, "text", "Value", "0,-90", ...
            "Tooltip", "Mount azimuth,elevation in the parent frame; 0,-90 points nadir from a satellite");
        mountAzElEdit.Layout.Row = 12;
        mountAzElEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Az/el rate (deg/s)");
        azElRateEdit = uieditfield(grid, "text", "Value", "Inf,Inf", ...
            "Tooltip", "Maximum gimbal slew rates; Inf,Inf = no slew constraint");
        azElRateEdit.Layout.Row = 13;
        azElRateEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Az/el accel (deg/s^2)");
        azElAccelEdit = uieditfield(grid, "text", "Value", "Inf,Inf", ...
            "Tooltip", "Maximum gimbal accelerations; Inf,Inf = no acceleration constraint");
        azElAccelEdit.Layout.Row = 14;
        azElAccelEdit.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Add Sensor", "ButtonPushedFcn", @addSensorFromDialog);
        btn.Layout.Row = 15;
        btn.Layout.Column = [1 2];

        function addSensorFromDialog(~, ~)
            progress = [];
            try
                progress = openProgress("Add Sensor", "Reading sensor inputs...", 0.10);
                sensorName = cleanObjectName(nameEdit.Value);
                targetName = string(targetDrop.Value);
                boresight = parseNumericVector(boresightEdit.Value, 3);
                rangeValues = parseNumericVector(rangeEdit.Value, 2);
                mountAzEl = parseNumericVector(mountAzElEdit.Value, 2);
                azElRate = parseNumericVector(azElRateEdit.Value, 2);
                azElAccel = parseNumericVector(azElAccelEdit.Value, 2);

                updateProgress(progress, 0.30, "Creating sensor definition...");
                switch string(typeDrop.Value)
                    case "Rectangular"
                        sensor = SensorObject.rectangular(sensorName, parentName, ...
                            rectXEdit.Value, rectYEdit.Value);
                    case "FixedVector"
                        sensor = SensorObject.fixedVector(sensorName, parentName, ...
                            boresight, coneEdit.Value);
                    case "Targeted"
                        if targetName == "<none>"
                            error("OrekitUI:MissingSensorTarget", ...
                                "Targeted sensors require a target object.");
                        end
                        sensor = SensorObject.targeted(sensorName, parentName, ...
                            targetName, coneEdit.Value);
                    otherwise
                        sensor = SensorObject.simpleConic(sensorName, parentName, coneEdit.Value);
                end
                sensor.PointingMode = string(pointingDrop.Value);
                if sensor.PointingMode == "Mounted"
                    sensor.MountingFrame = "Body";
                    sensor.BoresightFrame = "Body";
                end
                if sensor.PointingMode == "Targeted"
                    if targetName == "<none>"
                        error("OrekitUI:MissingSensorTarget", ...
                            "Targeted pointing requires a target object.");
                    end
                    sensor.CurrentPointingTarget = targetName;
                end
                sensor.BoresightVector = boresight;
                sensor = sensor.setMountOrientationAzEl(mountAzEl(1), mountAzEl(2));
                sensor.AzimuthRateLimitDegPerSec = azElRate(1);
                sensor.ElevationRateLimitDegPerSec = azElRate(2);
                sensor.AzimuthAccelerationLimitDegPerSec2 = azElAccel(1);
                sensor.ElevationAccelerationLimitDegPerSec2 = azElAccel(2);
                sensor.MinRangeKm = rangeValues(1);
                sensor.MaxRangeKm = rangeValues(2);
                sensor.MinElevationDeg = minElEdit.Value;

                updateProgress(progress, 0.55, "Attaching sensor to parent object...");
                scenario = addSensorToObject(scenario, parentName, sensor);
                selectedKind = "Sensor";
                selectedName = string(sensorName);
                selectedParentName = parentName;
                delete(dialog);
                updateProgress(progress, 0.85, "Updating object browser and sensor controls...");
                refreshAll();
                finishProgress(progress, "Sensor added.");
            catch err
                closeProgress(progress);
                uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                    "Could not add sensor");
            end
        end
    end

    function addSensorTaskCallback(~, ~)
        try
            targetName = string(taskTargetDrop.Value);
            if targetName == "<none>" || strlength(targetName) == 0
                error("OrekitUI:MissingTaskTarget", "Choose a target or area target for the task.");
            end
            taskType = string(taskTypeDrop.Value);
            taskID = "UI-TASK-" + compose("%03d", numel(taskList) + 1);
            task = SensorTask("TaskID", taskID, ...
                "TaskName", taskType + " " + targetName, ...
                "TaskType", taskType, ...
                "TargetName", targetName, ...
                "Priority", taskPriorityEdit.Value, ...
                "RequiredDwellTimeSeconds", taskDwellEdit.Value, ...
                "RequiredCoveragePercent", taskCoverageEdit.Value);
            sensorChoice = string(taskSensorDrop.Value);
            if sensorChoice ~= "<any>"
                task.AllowedSensorNames = sensorChoice;
            end
            if contains(upper(taskType), "MULTISENSOR")
                task.RequiredSensorCount = 2;
                task.RequiresSimultaneousSensors = contains(upper(taskType), "TRACK");
            end
            taskList{end + 1} = task;
            syncTaskProductsToScenario();
            setTaskSummary(sprintf("Added %s. Task list now has %d item(s).", task.TaskID, numel(taskList)));
            setStatus("Sensor task added", [0.10 0.42 0.14]);
        catch err
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Could not add sensor task");
        end
    end

    function clearSensorTasksCallback(~, ~)
        if ~isempty(taskList)
            choice = uiconfirm(fig, sprintf( ...
                "Remove all %d task(s) plus any candidates, conflicts, and schedule?", ...
                numel(taskList)), "Clear Sensor Tasks", ...
                "Options", ["Clear", "Cancel"], "CancelOption", "Cancel");
            if choice ~= "Clear"
                return;
            end
        end
        taskList = {};
        lastTaskCandidates = [];
        lastTaskConflicts = [];
        lastTaskSchedule = [];
        syncTaskProductsToScenario();
        setTaskSummary("Cleared sensor tasks and scheduling products.");
        setStatus("Sensor tasks cleared", [0.35 0.35 0.35]);
    end

    function generateTaskCandidatesCallback(~, ~)
        progress = [];
        try
            if isempty(taskList)
                error("OrekitUI:NoSensorTasks", "Add at least one sensor task first.");
            end
            progress = openProgress("Generate Task Candidates", ...
                "Applying scenario settings...", 0.05);
            applyScenarioConfig();
            updateProgress(progress, 0.18, "Checking propagation state...");
            if hasSatellites() && anySatellitesNeedPropagation()
                propagateScenarioInternal(progress, 0.18, 0.58);
            end
            updateProgress(progress, 0.65, "Generating backend task candidates...");
            options = SchedulerOptions("MinimumCandidateDurationSeconds", max(0, taskDwellEdit.Value));
            lastTaskCandidates = generateTaskCandidates(scenario, taskList, options);
            lastTaskConflicts = [];
            lastTaskSchedule = [];
            syncTaskProductsToScenario();
            updateProgress(progress, 0.92, "Updating task summary...");
            setTaskSummary(sprintf("Generated %d candidate(s) from %d task(s).", ...
                height(lastTaskCandidates), numel(taskList)));
            finishProgress(progress, "Task candidates generated.");
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Candidate generation failed");
        end
    end

    function detectTaskConflictsCallback(~, ~)
        progress = [];
        try
            if isempty(lastTaskCandidates)
                generateTaskCandidatesCallback([], []);
            end
            if isempty(lastTaskCandidates)
                return;
            end
            progress = openProgress("Detect Task Conflicts", ...
                "Checking candidate overlap and slew gaps...", 0.25);
            options = SchedulerOptions("MinimumCandidateDurationSeconds", max(0, taskDwellEdit.Value));
            lastTaskConflicts = detectTaskConflicts(lastTaskCandidates, options);
            syncTaskProductsToScenario();
            setTaskSummary(sprintf("Candidates: %d\nConflicts: %d", ...
                height(lastTaskCandidates), height(lastTaskConflicts)));
            finishProgress(progress, "Task conflicts detected.");
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Conflict detection failed");
        end
    end

    function runGreedySchedulerCallback(~, ~)
        progress = [];
        try
            if isempty(lastTaskCandidates)
                generateTaskCandidatesCallback([], []);
            end
            if isempty(lastTaskCandidates)
                return;
            end
            progress = openProgress("Greedy Sensor Scheduling", ...
                "Sorting candidates by priority and quality...", 0.20);
            options = SchedulerOptions("MinimumCandidateDurationSeconds", max(0, taskDwellEdit.Value));
            lastTaskSchedule = scheduleSensorTasksGreedy(scenario, lastTaskCandidates, options);
            lastTaskConflicts = detectTaskConflicts(lastTaskCandidates, options);
            syncTaskProductsToScenario();
            validation = validateSchedule(lastTaskSchedule, options);
            setTaskSummary(sprintf("Candidates: %d\nConflicts: %d\nScheduled: %d\nSchedule valid: %d", ...
                height(lastTaskCandidates), height(lastTaskConflicts), ...
                height(lastTaskSchedule), validation.IsValid));
            finishProgress(progress, "Greedy schedule complete.");
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Greedy scheduling failed");
        end
    end

    function exportMilpInputsCallback(~, ~)
        progress = [];
        try
            if isempty(lastTaskCandidates)
                generateTaskCandidatesCallback([], []);
            end
            if isempty(lastTaskConflicts)
                lastTaskConflicts = detectTaskConflicts(lastTaskCandidates, SchedulerOptions());
            end
            folder = uigetdir(pwd, "Select folder for MILP input CSV files");
            if ~(ischar(folder) || isstring(folder))
                return;
            end
            progress = openProgress("Export MILP Inputs", "Writing scheduler tables...", 0.30);
            files = exportMILPInputs(lastTaskCandidates, lastTaskConflicts, taskList, folder);
            setTaskSummary(["Exported MILP-ready inputs:"; string(files.Candidates); string(files.Conflicts); string(files.Tasks)]);
            finishProgress(progress, "MILP inputs exported.");
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "MILP export failed");
        end
    end

    function plotTaskTimelineCallback(~, ~)
        try
            if isempty(lastTaskSchedule)
                runGreedySchedulerCallback([], []);
            end
            if ~isempty(lastTaskSchedule)
                plotSensorTimeline(lastTaskSchedule);
            end
        catch err
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Timeline plot failed");
        end
    end

    function plotSelectedAreaTargetCallback(~, ~)
        try
            if selectedKind ~= "AreaTarget" || ~scenario.hasObject(selectedName)
                error("OrekitUI:NoAreaTargetSelected", "Select an area target first.");
            end
            plotAreaInMap(scenario.getObject(selectedName));
        catch err
            uialert(fig, getReport(err, "basic", "hyperlinks", "off"), ...
                "Area plot failed");
        end
    end

    function generateSelectedAreaGridCallback(~, ~)
        try
            if selectedKind ~= "AreaTarget" || ~scenario.hasObject(selectedName)
                error("OrekitUI:NoAreaTargetSelected", "Select an area target first.");
            end
            area = scenario.getObject(selectedName);
            area.GridPoints = area.generateGrid(area.GridResolutionKm);
            scenario = scenario.updateObject(area);
            refreshAll();
            setStatus(sprintf("Generated %d area grid point(s)", height(area.GridPoints)), [0.10 0.42 0.14]);
        catch err
            uialert(fig, getReport(err, "basic", "hyperlinks", "off"), ...
                "Grid generation failed");
        end
    end

    function plotCoverageCallback(~, ~)
        try
            name = string(coverageTargetDrop.Value);
            if name == "<none>" || ~scenario.hasObject(name)
                error("OrekitUI:NoAreaTargetSelected", "Choose an area target first.");
            end
            plotAreaInMap(scenario.getObject(name));
        catch err
            uialert(fig, getReport(err, "basic", "hyperlinks", "off"), ...
                "Coverage plot failed");
        end
    end

    function refreshSensorViewerCallback(~, ~)
        try
            satelliteName = string(viewerSatelliteDrop.Value);
            if satelliteName == "<none>" || ~scenario.hasObject(satelliteName)
                error("OrekitUI:NoSatelliteSelected", "Choose a satellite for the sensor viewer.");
            end
            opts = readSensorViewerOptionsFromUI();
            viewTabs.SelectedTab = sensorViewerTab;
            plotSatelliteSensorViewer(scenario, satelliteName, opts);
            setStatus("Sensor viewer refreshed", [0.10 0.42 0.14]);
        catch err
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Sensor viewer failed");
        end
    end

    function viewerSatelliteChanged(~, ~)
        refreshViewerSensorDropdown();
    end

    function opts = readSensorViewerOptionsFromUI()
        opts = SensorViewerOptions();
        opts.ParentAxes = sensorViewerAxes;
        opts.ShowSatelliteBody = viewerShowBodyCheck.Value;
        opts.ShowBodyFrame = viewerShowAxesCheck.Value;
        opts.ShowSensorMounts = viewerShowMountsCheck.Value;
        opts.ShowLabels = viewerShowLabelsCheck.Value;
        opts.ShowBoresight = viewerShowBoresightCheck.Value;
        opts.ShowFOV = viewerShowFOVCheck.Value;
        opts.ShowFOR = viewerShowFORCheck.Value;
        opts.FOVScale = viewerFOVScaleEdit.Value;
        opts.FORScale = viewerFORScaleEdit.Value;
        sensorName = string(viewerSensorDrop.Value);
        if sensorName ~= "<all>"
            opts.SelectedSensorName = sensorName;
        end
    end

    function plotAreaInMap(area)
        viewTabs.SelectedTab = mapTab;
        cla(mapAxes);
        plotAreaTarget(area, mapAxes);
        title(mapAxes, "Coverage - " + area.Name);
    end

    function setTaskSummary(lines)
        setTextArea(accessSummaryText, lines);
    end

    function syncTaskProductsToScenario()
        scenario.SensorTasks = taskList;
        if istable(lastTaskCandidates)
            scenario.TaskCandidates = lastTaskCandidates;
        else
            scenario.TaskCandidates = table();
        end
        if istable(lastTaskConflicts)
            scenario.TaskConflicts = lastTaskConflicts;
        else
            scenario.TaskConflicts = table();
        end
        if istable(lastTaskSchedule)
            scenario.SensorSchedule = lastTaskSchedule;
        else
            scenario.SensorSchedule = table();
        end
    end

    function restoreTaskProductsFromScenario()
        if isprop(scenario, "SensorTasks")
            taskList = scenario.SensorTasks;
        else
            taskList = {};
        end
        if isprop(scenario, "TaskCandidates") && ~isempty(scenario.TaskCandidates)
            lastTaskCandidates = scenario.TaskCandidates;
        else
            lastTaskCandidates = [];
        end
        if isprop(scenario, "TaskConflicts") && ~isempty(scenario.TaskConflicts)
            lastTaskConflicts = scenario.TaskConflicts;
        else
            lastTaskConflicts = [];
        end
        if isprop(scenario, "SensorSchedule") && ~isempty(scenario.SensorSchedule)
            lastTaskSchedule = scenario.SensorSchedule;
        else
            lastTaskSchedule = [];
        end
    end

    function refreshAll()
        updateScenarioControls();
        refreshObjectBrowser();
        refreshAccessDropdowns();
        refreshSensorDropdowns();
        refreshTaskingDropdowns();
        refreshAnalysisDropdowns();
        refreshInspector();
        refreshVisualization();
    end

    function refreshObjectBrowser()
        if isempty(objectTree) || ~isvalid(objectTree)
            return;
        end

        if strlength(selectedName) > 0 && selectedKind ~= "Sensor" && ~scenario.hasObject(selectedName)
            selectedKind = "Scenario";
            selectedName = "";
        end

        delete(objectTree.Children);
        scenarioNode = uitreenode(objectTree, "Text", char(scenario.Config.Name), ...
            "NodeData", struct("Kind", "Scenario", "Name", ""));
        satFolder = uitreenode(scenarioNode, ...
            "Text", sprintf("Satellites (%d)", satelliteCount()), ...
            "NodeData", struct("Kind", "Folder", "Name", ""));
        placeFolder = uitreenode(scenarioNode, ...
            "Text", sprintf("Places (%d)", groundStationCount()), ...
            "NodeData", struct("Kind", "Folder", "Name", ""));
        targetFolder = uitreenode(scenarioNode, ...
            "Text", sprintf("Targets (%d)", targetCount()), ...
            "NodeData", struct("Kind", "Folder", "Name", ""));
        areaFolder = uitreenode(scenarioNode, ...
            "Text", sprintf("Area Targets (%d)", areaTargetCount()), ...
            "NodeData", struct("Kind", "Folder", "Name", ""));

        selectedNode = scenarioNode;
        for k = 1:numel(scenario.Objects)
            obj = scenario.Objects{k};
            if isa(obj, "SatelliteObject")
                node = uitreenode(satFolder, "Text", char(obj.Name), ...
                    "NodeData", struct("Kind", "Satellite", "Name", char(obj.Name)));
            elseif isa(obj, "TargetObject")
                node = uitreenode(targetFolder, "Text", char(obj.Name), ...
                    "NodeData", struct("Kind", "Target", "Name", char(obj.Name)));
            elseif isa(obj, "AreaTargetObject")
                node = uitreenode(areaFolder, "Text", char(obj.Name), ...
                    "NodeData", struct("Kind", "AreaTarget", "Name", char(obj.Name)));
            elseif isFixedLocationObject(obj)
                node = uitreenode(placeFolder, "Text", char(obj.Name), ...
                    "NodeData", struct("Kind", "GroundStation", "Name", char(obj.Name)));
            else
                node = [];
            end
            if ~isempty(node) && strcmp(string(obj.Name), selectedName)
                selectedNode = node;
            end
            if ~isempty(node) && isprop(obj, "Sensors")
                for s = 1:numel(obj.Sensors)
                    sensor = obj.Sensors{s};
                    sensorNode = uitreenode(node, "Text", char(sensor.Name), ...
                        "NodeData", struct("Kind", "Sensor", ...
                        "Name", char(sensor.Name), "ParentName", char(obj.Name)));
                    if selectedKind == "Sensor" && selectedName == string(sensor.Name)
                        selectedNode = sensorNode;
                    end
                end
            end
        end

        expandNode(scenarioNode);
        expandNode(satFolder);
        expandNode(placeFolder);
        expandNode(targetFolder);
        expandNode(areaFolder);
        objectTree.SelectedNodes = selectedNode;
    end

    function onObjectSelected(~, event)
        if isempty(event.SelectedNodes)
            selectedKind = "Scenario";
            selectedName = "";
            selectedParentName = "";
        else
            data = event.SelectedNodes(1).NodeData;
            if isempty(data) || ~isfield(data, "Kind") || strcmp(data.Kind, "Folder")
                selectedKind = "Scenario";
                selectedName = "";
                selectedParentName = "";
            else
                selectedKind = string(data.Kind);
                selectedName = string(data.Name);
                if isfield(data, "ParentName")
                    selectedParentName = string(data.ParentName);
                else
                    selectedParentName = "";
                end
            end
        end
        refreshInspector();
        refreshVisualization();
    end

    function refreshInspector()
        if isempty(objectInfoText) || ~isvalid(objectInfoText)
            return;
        end

        if selectedKind == "Satellite" && scenario.hasObject(selectedName)
            sat = scenario.getObject(selectedName);
            selectedLabel.Text = char(sat.Name);
            lines = [
                "Type: Satellite"
                "Orbit: " + sat.OrbitDefinitionType
                "Propagator: " + sat.PropagatorType
                sprintf("SMA: %.3f km", sat.SemiMajorAxisMeters / 1000.0)
                sprintf("e: %.7f", sat.Eccentricity)
                sprintf("i: %.4f deg", sat.InclinationDeg)
                sprintf("RAAN: %.4f deg", sat.RAANDeg)
                sprintf("Arg. perigee: %.4f deg", sat.ArgPerigeeDeg)
                sprintf("True anomaly: %.4f deg", sat.TrueAnomalyDeg)
                ];
            if sat.IsPropagated && ~isempty(sat.Ephemeris)
                lla = sat.getLLA(scenario.CurrentAnimationTime);
                state = sat.getState(scenario.CurrentAnimationTime);
                lines = [
                    lines
                    sprintf("Samples: %d", height(sat.Ephemeris))
                    "Scenario time: " + formatUtc(scenario.CurrentAnimationTime)
                    sprintf("Subpoint: %.5f lat, %.5f lon", lla(1), lla(2))
                    sprintf("Altitude: %.3f km", lla(3) / 1000.0)
                    sprintf("ECI km: [%.3f, %.3f, %.3f]", ...
                    state(1) / 1000.0, state(2) / 1000.0, state(3) / 1000.0)
                    ];
            else
                lines = [lines; "Status: not propagated"];
            end
            setTextArea(objectInfoText, lines);
            return;
        end

        if selectedKind == "AreaTarget" && scenario.hasObject(selectedName)
            area = scenario.getObject(selectedName);
            selectedLabel.Text = char(area.Name);
            gridPoints = area.getGridPoints();
            setTextArea(objectInfoText, [
                "Type: Area Target"
                "Area type: " + area.AreaType
                sprintf("Centroid: %.6f lat, %.6f lon", area.LatitudeDeg, area.LongitudeDeg)
                sprintf("Boundary vertices: %d", numel(area.BoundaryLatDeg))
                sprintf("Grid points: %d", height(gridPoints))
                sprintf("Grid resolution: %.3f km", area.GridResolutionKm)
                sprintf("Required coverage: %.1f %%", area.RequiredCoveragePercent)
                sprintf("Approx area: %.3f km^2", area.getAreaKm2())
                ]);
            return;
        end

        if (selectedKind == "GroundStation" || selectedKind == "Target") && scenario.hasObject(selectedName)
            place = scenario.getObject(selectedName);
            selectedLabel.Text = char(place.Name);
            objectTypeLabel = "Place";
            if isa(place, "TargetObject")
                objectTypeLabel = "Target";
            end
            lines = [
                "Type: " + objectTypeLabel
                sprintf("Latitude: %.6f deg", place.LatitudeDeg)
                sprintf("Longitude: %.6f deg", place.LongitudeDeg)
                sprintf("Altitude: %.3f km", place.AltitudeMeters / 1000.0)
                ];
            if isprop(place, "MinElevationDeg")
                lines = [lines; sprintf("Min elevation: %.3f deg", place.MinElevationDeg)];
            end
            setTextArea(objectInfoText, lines);
            return;
        end

        if selectedKind == "Sensor" && scenario.hasObject(selectedParentName)
            parent = scenario.getObject(selectedParentName);
            if isprop(parent, "Sensors") && parent.hasSensor(selectedName)
                sensor = parent.getSensor(selectedName);
                selectedLabel.Text = char(sensor.Name);
                setTextArea(objectInfoText, [
                    "Type: Sensor"
                    "Parent: " + sensor.ParentName
                    "Sensor type: " + sensor.SensorType
                    "Pointing: " + sensor.PointingMode
                    "FOV: " + sensor.FieldOfViewType
                    sprintf("Cone half-angle: %.3f deg", sensor.ConeHalfAngleDeg)
                    sprintf("Rect X/Y: %.3f / %.3f deg", ...
                    sensor.RectangularHalfAngleXDeg, sensor.RectangularHalfAngleYDeg)
                    sprintf("Range: %.3f to %.3f km", ...
                    sensor.MinRangeKm, sensor.MaxRangeKm)
                    sprintf("Min elevation: %.3f deg", sensor.MinElevationDeg)
                    sprintf("Mount az/el: %.3f / %.3f deg", ...
                    sensor.MountAzimuthDeg, sensor.MountElevationDeg)
                    sprintf("Az/el rate limits: %.3f / %.3f deg/s", ...
                    sensor.AzimuthRateLimitDegPerSec, sensor.ElevationRateLimitDegPerSec)
                    sprintf("Az/el accel limits: %.3f / %.3f deg/s^2", ...
                    sensor.AzimuthAccelerationLimitDegPerSec2, ...
                    sensor.ElevationAccelerationLimitDegPerSec2)
                    "Targeted at: " + sensor.CurrentPointingTarget
                    ]);
                return;
            end
        end

        selectedKind = "Scenario";
        selectedName = "";
        selectedLabel.Text = char(scenario.Config.Name);
        setTextArea(objectInfoText, [
            "Type: Scenario"
            "Epoch UTC: " + formatUtc(scenario.Config.Epoch)
            "Stop UTC: " + formatUtc(scenario.Config.getStopTime())
            sprintf("Duration: %s", scenarioDurationLabel())
            sprintf("Time step: %.3f s", seconds(scenario.Config.TimeStep))
            sprintf("Animation step: %.3f s", seconds(scenario.Config.AnimationStep))
            sprintf("Satellites: %d", satelliteCount())
            sprintf("Places: %d", groundStationCount())
            sprintf("Targets: %d", targetCount())
            sprintf("Area targets: %d", areaTargetCount())
            sprintf("Sensor tasks: %d", numel(taskList))
            "Scenario UTC: " + formatUtc(scenario.CurrentAnimationTime)
            ]);
    end

    function refreshViewsCallback(~, ~)
        refreshVisualization();
    end

    function refreshVisualization()
        draw2DView();
        draw3DView();
    end

    function draw2DView()
        if isempty(mapAxes) || ~isvalid(mapAxes)
            return;
        end

        cla(mapAxes);
        hold(mapAxes, "on");
        mapAxes.Color = [0.74 0.87 1.00];
        mapAxes.XLim = [-180 180];
        mapAxes.YLim = [-90 90];
        mapAxes.XTick = -180:30:180;
        mapAxes.YTick = -90:15:90;
        mapAxes.XGrid = "on";
        mapAxes.YGrid = "on";
        mapAxes.Box = "on";
        xlabel(mapAxes, "Longitude (deg)");
        ylabel(mapAxes, "Latitude (deg)");
        title(mapAxes, "2D Graphics - " + scenario.Config.Name + ...
            " - " + formatUtc(scenario.CurrentAnimationTime));
        drawEarthCoastlines2D(mapAxes);

        if showPlacesCheck.Value
            drawPlaces2D();
        end
        drawSatellites2D();
        drawSensorFootprints2D();
        hold(mapAxes, "off");
    end

    function drawSensorFootprints2D()
        for footprint = collectSensorFootprints()
            data = footprint{1};
            [lon, lat] = splitDateline(data.LongitudeDeg, data.LatitudeDeg);
            if data.Type == "FOR"
                plot(mapAxes, lon, lat, "--", "Color", [0.20 0.55 0.95], ...
                    "LineWidth", 1.2);
                continue;
            end

            taskActive = isfield(data, "Pointing") && data.Pointing.Mode == "Task";
            lineWidth = 1.4;
            if taskActive
                lineWidth = 2.2;
            end
            plot(mapAxes, lon, lat, "-", "Color", data.Color, "LineWidth", lineWidth);

            if taskActive
                aim = data.Pointing.AimEcefMeters;
                aimLat = asind(aim(3) / norm(aim));
                aimLon = atan2d(aim(2), aim(1));
                [beamLon, beamLat] = splitDateline( ...
                    [data.SubLongitudeDeg; aimLon], [data.SubLatitudeDeg; aimLat]);
                plot(mapAxes, beamLon, beamLat, "-", ...
                    "Color", [0.95 0.25 0.15], "LineWidth", 1.6);
                scatter(mapAxes, aimLon, aimLat, 70, "p", "filled", ...
                    "MarkerFaceColor", [0.95 0.25 0.15], "MarkerEdgeColor", [1 1 1]);
                text(mapAxes, aimLon, aimLat, ...
                    char("  " + data.SensorName + " > " + data.Pointing.TargetName), ...
                    "Color", [0.55 0.08 0.05], "FontSize", 8, "FontWeight", "bold");
            end
        end
    end

    function footprints = collectSensorFootprints()
        %COLLECTSENSORFOOTPRINTS Footprints for every satellite sensor at the
        % current scenario time, honoring the FOV/FOR view toggles. Sensors
        % whose footprint cannot be computed (e.g. targeted sensors without a
        % target) are skipped silently so one bad sensor never blocks redraw.
        footprints = {};
        if isempty(showSensorFovCheck) || ...
                (~showSensorFovCheck.Value && ~showSensorForCheck.Value)
            return;
        end
        time = scenario.CurrentAnimationTime;
        for k = 1:numel(scenario.Objects)
            obj = scenario.Objects{k};
            if ~isa(obj, "SatelliteObject") || isempty(obj.Ephemeris)
                continue;
            end
            for s = 1:numel(obj.Sensors)
                sensor = obj.Sensors{s};
                if showSensorFovCheck.Value
                    try
                        footprint = computeSensorFootprint(scenario, obj.Name, ...
                            sensor.Name, time);
                        footprint.Color = sensor.Color;
                        footprint.Pointing = resolveSensorPointing(scenario, ...
                            obj.Name, sensor.Name, time);
                        footprints{end + 1} = footprint; %#ok<AGROW>
                    catch
                    end
                end
                if showSensorForCheck.Value
                    try
                        footprint = computeSensorFootprint(scenario, obj.Name, ...
                            sensor.Name, time, struct("UseFieldOfRegard", true));
                        footprint.Color = sensor.Color;
                        footprints{end + 1} = footprint; %#ok<AGROW>
                    catch
                    end
                end
            end
        end
    end

    function drawPlaces2D()
        for k = 1:numel(scenario.Objects)
            obj = scenario.Objects{k};
            if ~isFixedLocationObject(obj)
                continue;
            end
            markerSize = 58;
            edgeColor = [1 1 1];
            if selectedKind == "GroundStation" && selectedName == string(obj.Name)
                markerSize = 86;
                edgeColor = [0.04 0.08 0.18];
            end
            scatter(mapAxes, obj.LongitudeDeg, obj.LatitudeDeg, markerSize, ...
                "filled", "MarkerFaceColor", obj.Color, ...
                "MarkerEdgeColor", edgeColor, "LineWidth", 1.1);
            text(mapAxes, obj.LongitudeDeg, obj.LatitudeDeg, ...
                char("  " + obj.Name), "FontWeight", "bold", ...
                "Color", [0.06 0.13 0.30]);
        end
    end

    function drawSatellites2D()
        for k = 1:numel(scenario.Objects)
            obj = scenario.Objects{k};
            if ~isa(obj, "SatelliteObject") || isempty(obj.Ephemeris)
                continue;
            end
            eph = obj.Ephemeris;
            if showTrackCheck.Value
                [lon, lat] = splitDateline(eph.LongitudeDeg, eph.LatitudeDeg);
                plot(mapAxes, lon, lat, "Color", [0.95 0.68 0.12], ...
                    "LineWidth", 1.3);
            end
            idx = nearestSampleIndex(eph.Time, scenario.CurrentAnimationTime);
            markerSize = 72;
            edgeColor = [1 1 1];
            if selectedKind == "Satellite" && selectedName == string(obj.Name)
                markerSize = 104;
                edgeColor = [0.25 0.03 0.03];
            end
            scatter(mapAxes, eph.LongitudeDeg(idx), eph.LatitudeDeg(idx), markerSize, ...
                "filled", "MarkerFaceColor", obj.Color, ...
                "MarkerEdgeColor", edgeColor, "LineWidth", 1.1);
            text(mapAxes, eph.LongitudeDeg(idx), eph.LatitudeDeg(idx), ...
                char("  " + obj.Name), "FontWeight", "bold", ...
                "Color", [0.26 0.05 0.05]);
        end
    end

    function draw3DView()
        if isempty(globeAxes) || ~isvalid(globeAxes)
            return;
        end

        cla(globeAxes);
        hold(globeAxes, "on");
        frameName = current3DFrame();
        earthAngleRad = earthRotationAngle(scenario.CurrentAnimationTime);
        radiusKm = 6378.137;
        [x, y, z] = sphere(72);
        surf(globeAxes, radiusKm * x, radiusKm * y, radiusKm * z, ...
            "FaceColor", [0.24 0.52 0.82], "EdgeColor", "none", ...
            "FaceAlpha", 0.96);
        drawEarthCoastlines3D(globeAxes, radiusKm + 2, frameName, earthAngleRad);

        maxRangeKm = radiusKm * 1.25;
        if showPlacesCheck.Value
            maxRangeKm = max(maxRangeKm, drawPlaces3D(radiusKm, frameName, earthAngleRad));
        end
        maxRangeKm = max(maxRangeKm, drawSatellites3D(frameName));
        drawSensorFootprints3D(frameName, earthAngleRad);

        axis(globeAxes, "equal");
        lim = max(8000, maxRangeKm * 1.08);
        globeAxes.XLim = [-lim lim];
        globeAxes.YLim = [-lim lim];
        globeAxes.ZLim = [-lim lim];
        globeAxes.Visible = "off";
        title(globeAxes, "3D Graphics - " + frameName + frameMotionLabel(frameName));
        view(globeAxes, 35, 22);
        light(globeAxes, "Position", [1 0 1], "Style", "infinite");
        lighting(globeAxes, "gouraud");
        hold(globeAxes, "off");
    end

    function maxRangeKm = drawPlaces3D(radiusKm, frameName, earthAngleRad)
        maxRangeKm = radiusKm;
        for k = 1:numel(scenario.Objects)
            obj = scenario.Objects{k};
            if ~isFixedLocationObject(obj)
                continue;
            end
            [px, py, pz] = geodeticToCartesian(obj.LatitudeDeg, ...
                obj.LongitudeDeg, obj.AltitudeMeters / 1000.0);
            [px, py, pz] = earthFixedToViewFrame(px, py, pz, frameName, earthAngleRad);
            maxRangeKm = max(maxRangeKm, norm([px, py, pz]));
            scatter3(globeAxes, px, py, pz, 54, "filled", ...
                "MarkerFaceColor", obj.Color, "MarkerEdgeColor", [1 1 1]);
        end
    end

    function maxRangeKm = drawSatellites3D(frameName)
        maxRangeKm = 0;
        for k = 1:numel(scenario.Objects)
            obj = scenario.Objects{k};
            if ~isa(obj, "SatelliteObject") || isempty(obj.Ephemeris)
                continue;
            end
            eph = obj.Ephemeris;
            [xKm, yKm, zKm] = satellitePathKm(eph, frameName);
            maxRangeKm = max(maxRangeKm, max(vecnorm([xKm, yKm, zKm], 2, 2)));

            if showOrbitCheck.Value
                plot3(globeAxes, xKm, yKm, zKm, ...
                    "Color", [0.95 0.68 0.12], "LineWidth", 1.15);
            end

            currentKm = satellitePositionKmAtTime(obj, frameName);
            markerSize = 78;
            edgeColor = [1 1 1];
            if selectedKind == "Satellite" && selectedName == string(obj.Name)
                markerSize = 110;
                edgeColor = [0.25 0.03 0.03];
            end
            scatter3(globeAxes, currentKm(1), currentKm(2), currentKm(3), markerSize, ...
                "filled", "MarkerFaceColor", obj.Color, ...
                "MarkerEdgeColor", edgeColor, "LineWidth", 1.1);
            plot3(globeAxes, [0 currentKm(1)], [0 currentKm(2)], [0 currentKm(3)], ...
                "Color", [0.95 0.74 0.18], "LineWidth", 0.8);
        end
    end

    function drawSensorFootprints3D(frameName, earthAngleRad)
        for footprint = collectSensorFootprints()
            data = footprint{1};
            parent = scenario.getObject(data.ParentName);
            apexKm = satellitePositionKmAtTime(parent, frameName);
            % Lift the outline slightly off the globe so it stays visible.
            rimKm = data.EcefMeters / 1000.0 * 1.004;
            [rx, ry, rz] = earthFixedToViewFrame(rimKm(:, 1), rimKm(:, 2), ...
                rimKm(:, 3), frameName, earthAngleRad);
            ax3 = apexKm(1);
            ay3 = apexKm(2);
            az3 = apexKm(3);

            taskActive = data.Type ~= "FOR" && isfield(data, "Pointing") && ...
                data.Pointing.Mode == "Task";
            if data.Type == "FOR"
                color = [0.20 0.55 0.95];
                faceAlpha = 0.06;
                lineStyle = "--";
            elseif taskActive
                color = data.Color;
                faceAlpha = 0.22;
                lineStyle = "-";
            else
                color = data.Color;
                faceAlpha = 0.12;
                lineStyle = "-";
            end
            plot3(globeAxes, rx, ry, rz, lineStyle, "Color", color, ...
                "LineWidth", 1.3);

            vertices = [ax3, ay3, az3; rx(:), ry(:), rz(:)];
            n = numel(rx);
            faces = [ones(n - 1, 1), (2:n).', (3:n + 1).'];
            patch(globeAxes, "Vertices", vertices, "Faces", faces, ...
                "FaceColor", color, "FaceAlpha", faceAlpha, ...
                "EdgeColor", "none");

            if taskActive
                aimKm = data.Pointing.AimEcefMeters / 1000.0;
                [bx, by, bz] = earthFixedToViewFrame(aimKm(1), aimKm(2), ...
                    aimKm(3), frameName, earthAngleRad);
                plot3(globeAxes, [ax3 bx], [ay3 by], [az3 bz], "-", ...
                    "Color", [0.95 0.25 0.15], "LineWidth", 2.0);
                scatter3(globeAxes, bx, by, bz, 60, "p", "filled", ...
                    "MarkerFaceColor", [0.95 0.25 0.15], "MarkerEdgeColor", [1 1 1]);
            end
        end
    end

    function drawEarthCoastlines2D(ax)
        try
            coast = load("coastlines");
            plot(ax, coast.coastlon, coast.coastlat, ...
                "Color", [0.10 0.35 0.18], "LineWidth", 0.85);
        catch
            rectangle("Parent", ax, "Position", [-180 -90 360 180], ...
                "EdgeColor", [0.2 0.2 0.2]);
        end
    end

    function drawEarthCoastlines3D(ax, radiusKm, frameName, earthAngleRad)
        try
            coast = load("coastlines");
            [x, y, z] = latLonToSphere(coast.coastlat, coast.coastlon, radiusKm);
            [x, y, z] = earthFixedToViewFrame(x, y, z, frameName, earthAngleRad);
            plot3(ax, x, y, z, "Color", [0.02 0.18 0.06], "LineWidth", 0.65);
        catch
        end
    end

    function focusSelectedObject(~, ~)
        viewTabs.SelectedTab = mapTab;
        refreshVisualization();
        if selectedKind == "Satellite" && scenario.hasObject(selectedName)
            sat = scenario.getObject(selectedName);
            if ~isempty(sat.Ephemeris)
                lla = sat.getLLA(scenario.CurrentAnimationTime);
                mapAxes.XLim = clampWindow(lla(2), 55, -180, 180);
                mapAxes.YLim = clampWindow(lla(1), 35, -90, 90);
            end
        elseif any(selectedKind == ["GroundStation", "Target", "AreaTarget"]) && scenario.hasObject(selectedName)
            place = scenario.getObject(selectedName);
            mapAxes.XLim = clampWindow(place.LongitudeDeg, 55, -180, 180);
            mapAxes.YLim = clampWindow(place.LatitudeDeg, 35, -90, 90);
        end
    end

    function selectView(tab)
        if ~isempty(tab) && isvalid(tab)
            viewTabs.SelectedTab = tab;
        end
    end

    function deleteSelectedObject(~, ~)
        if selectedKind == "Sensor"
            scenario = removeSensorFromObject(scenario, selectedParentName, selectedName);
            selectedKind = "Scenario";
            selectedName = "";
            selectedParentName = "";
            refreshAll();
            return;
        end
        if selectedKind ~= "Satellite" && selectedKind ~= "GroundStation" && ...
                selectedKind ~= "Target" && selectedKind ~= "AreaTarget"
            return;
        end
        nameToRemove = selectedName;
        scenario = scenario.removeObject(nameToRemove);
        field = matlab.lang.makeValidName(nameToRemove);
        if isfield(scenario.PropagationResults, field)
            scenario.PropagationResults = rmfield(scenario.PropagationResults, field);
        end
        selectedKind = "Scenario";
        selectedName = "";
        selectedParentName = "";
        refreshAll();
    end

    function computeAccessCallback(~, ~)
        progress = [];
        try
            progress = openProgress("Compute Access", ...
                "Applying scenario settings...", 0.05);
            applyScenarioConfig();
            updateProgress(progress, 0.15, "Checking Orekit runtime...");
            requireConfigured();
            if hasSatellites() && anySatellitesNeedPropagation()
                updateProgress(progress, 0.25, "Propagating satellites before access...");
                propagateScenarioInternal(progress, 0.25, 0.62);
            end

            updateProgress(progress, 0.68, "Reading access pair...");
            sourceName = string(accessSourceDrop.Value);
            targetName = string(accessTargetDrop.Value);
            if sourceName == "<none>" || targetName == "<none>" || sourceName == targetName
                error("OrekitUI:InvalidAccessPair", ...
                    "Choose two different scenario objects for access.");
            end

            updateProgress(progress, 0.78, ...
                sprintf("Computing access: %s to %s...", sourceName, targetName));
            result = scenario.computeAccess(sourceName, targetName);
            updateProgress(progress, 0.90, "Updating access results...");
            resultName = matlab.lang.makeValidName(sourceName + "_to_" + targetName);
            scenario.AccessResults.(resultName) = result;
            lastAccessResult = result;
            setTextArea(accessSummaryText, accessResultLines(result));
            finishProgress(progress, "Access computation complete.");
        catch err
            closeProgress(progress);
            setStatus("Access computation failed", [0.55 0.18 0.08]);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Access computation failed");
        end
    end

    function sensorParentChanged(~, ~)
        refreshSensorDropdowns();
    end

    function deleteSensorCallback(~, ~)
        progress = [];
        try
            parentName = string(sensorParentDrop.Value);
            sensorName = string(sensorDrop.Value);
            if parentName == "<none>" || sensorName == "<none>"
                return;
            end
            progress = openProgress("Delete Sensor", "Removing sensor...", 0.35);
            scenario = removeSensorFromObject(scenario, parentName, sensorName);
            selectedKind = "Scenario";
            selectedName = "";
            selectedParentName = "";
            refreshAll();
            finishProgress(progress, "Sensor deleted.");
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Could not delete sensor");
        end
    end

    function computeSensorAccessCallback(~, ~)
        progress = [];
        try
            parentName = string(sensorParentDrop.Value);
            sensorName = string(sensorDrop.Value);
            targetName = string(sensorTargetDrop.Value);
            if parentName == "<none>" || sensorName == "<none>" || targetName == "<none>"
                error("OrekitUI:InvalidSensorAccessInputs", ...
                    "Choose a parent, sensor, and target object.");
            end

            progress = openProgress("Compute Sensor Access", ...
                "Applying scenario settings...", 0.05);
            applyScenarioConfig();
            updateProgress(progress, 0.15, "Checking Orekit runtime...");
            requireConfigured();
            if hasSatellites() && anySatellitesNeedPropagation()
                updateProgress(progress, 0.25, "Propagating satellites before sensor access...");
                propagateScenarioInternal(progress, 0.25, 0.60);
            end

            updateProgress(progress, 0.72, ...
                sprintf("Computing sensor access: %s/%s to %s...", ...
                parentName, sensorName, targetName));
            result = computeSensorAccess(scenario, parentName, sensorName, targetName);
            lastSensorAccessResult = result;
            resultName = matlab.lang.makeValidName(parentName + "_" + sensorName + "_to_" + targetName);
            scenario.AccessResults.(resultName) = result;
            updateProgress(progress, 0.92, "Updating sensor access summary...");
            setTextArea(accessSummaryText, sensorAccessResultLines(result));
            finishProgress(progress, "Sensor access computation complete.");
        catch err
            closeProgress(progress);
            setStatus("Sensor access computation failed", [0.55 0.18 0.08]);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Sensor access computation failed");
        end
    end

    function plotSensorTimelineCallback(~, ~)
        try
            result = requireSensorAccessResult();
            plotSensorAccessTimeline(result);
        catch err
            uialert(fig, getReport(err, "basic", "hyperlinks", "off"), ...
                "No sensor access result");
        end
    end

    function plotOffBoresightCallback(~, ~)
        try
            result = requireSensorAccessResult();
            plotOffBoresightAngle(result);
        catch err
            uialert(fig, getReport(err, "basic", "hyperlinks", "off"), ...
                "No sensor access result");
        end
    end

    function plotSensorRangeCallback(~, ~)
        try
            result = requireSensorAccessResult();
            plotSensorRange(result);
        catch err
            uialert(fig, getReport(err, "basic", "hyperlinks", "off"), ...
                "No sensor access result");
        end
    end

    function exportSensorAccessCallback(~, ~)
        progress = [];
        try
            result = requireSensorAccessResult();
            [file, folder] = uiputfile("*.csv", "Export Sensor Access Report", ...
                "sensor_access_report.csv");
            if isequal(file, 0)
                return;
            end
            progress = openProgress("Export Sensor Access", ...
                "Writing sensor access report...", 0.25);
            exportSensorAccessReport(result, fullfile(folder, file));
            finishProgress(progress, "Sensor access report exported.");
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Could not export sensor access report");
        end
    end

    function result = requireSensorAccessResult()
        if isempty(lastSensorAccessResult)
            error("OrekitUI:NoSensorAccessResult", ...
                "Compute sensor access before plotting or exporting.");
        end
        result = lastSensorAccessResult;
    end

    function lines = sensorAccessResultLines(result)
        header = string(result.ParentName) + "/" + string(result.SensorName) + ...
            " -> " + string(result.TargetName);
        if height(result.AccessWindows) == 0
            lines = [
                header
                "Windows: 0"
                "No access found within the scenario interval."
                ];
            return;
        end
        firstWindow = result.AccessWindows(1, :);
        lines = [
            header
            sprintf("Windows: %d", height(result.AccessWindows))
            sprintf("Total duration: %.1f min", result.Duration / 60.0)
            sprintf("Max elevation: %.3f deg", result.MaxElevation)
            sprintf("Min range: %.3f km", result.MinRange)
            sprintf("Max off-boresight: %.3f deg", result.MaxOffBoresight)
            "First start: " + formatUtc(firstWindow.StartTime)
            "First stop: " + formatUtc(firstWindow.StopTime)
            ];
    end

    function lines = accessResultLines(result)
        header = string(result.SourceName) + " -> " + string(result.TargetName);
        if height(result.AccessWindows) == 0
            lines = [
                header
                "Windows: 0"
                "No access found within the scenario interval."
                ];
            return;
        end
        firstWindow = result.AccessWindows(1, :);
        lines = [
            header
            sprintf("Windows: %d", height(result.AccessWindows))
            sprintf("Total duration: %.1f min", result.Duration / 60.0)
            sprintf("Max elevation: %.3f deg", result.MaxElevation)
            sprintf("Min range: %.3f km", result.MinRange)
            "First start: " + formatUtc(firstWindow.StartTime)
            "First stop: " + formatUtc(firstWindow.StopTime)
            ];
    end

    function exportToWorkspace(~, ~)
        assignin("base", "orekitScenario", scenario);
        lines = "Exported to base workspace: orekitScenario";
        if ~isempty(lastAccessResult)
            assignin("base", "orekitAccessResult", lastAccessResult);
            lines(end + 1, 1) = "Exported: orekitAccessResult (last access result)";
        end
        if ~isempty(lastSensorAccessResult)
            assignin("base", "orekitSensorAccessResult", lastSensorAccessResult);
            lines(end + 1, 1) = "Exported: orekitSensorAccessResult (last sensor access result)";
        end
        setTextArea(objectInfoText, lines);
        setStatus("Scenario exported to workspace", [0.10 0.42 0.14]);
    end

    function exportEphemerisCallback(~, ~)
        progress = [];
        try
            folder = uigetdir(repoRoot, "Select folder for ephemeris CSV files");
            if isequal(folder, 0)
                return;
            end
            progress = openProgress("Export Ephemeris", ...
                "Writing ephemeris CSV files...", 0.25);
            exportEphemeris(scenario, folder);
            updateProgress(progress, 0.90, "Updating export status...");
            setTextArea(accessSummaryText, "Exported ephemeris CSV files to " + string(folder));
            finishProgress(progress, "Ephemeris export complete.");
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Could not export ephemeris");
        end
    end

    function saveScenarioCallback(~, ~)
        progress = [];
        try
            applyScenarioConfig();
            syncTaskProductsToScenario();
            [file, folder] = uiputfile("*.mat", "Save Orekit Scenario", ...
                "orekit-scenario.mat");
            if isequal(file, 0)
                return;
            end
            progress = openProgress("Save Scenario", ...
                "Saving MATLAB scenario and STK interchange bundle...", 0.30);
            saveResult = saveScenario(scenario, fullfile(folder, file));
            updateProgress(progress, 0.90, "Updating scenario status...");
            setTextArea(objectInfoText, [ ...
                "Saved scenario: " + string(saveResult.NativeFile); ...
                "STK bundle: " + string(saveResult.StkBundle.BundleFolder); ...
                "Run loadStkBundle in that folder on an STK machine to create .sc and .vdf files."]);
            finishProgress(progress, "Scenario saved.");
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Could not save scenario");
        end
    end

    function loadScenarioCallback(~, ~)
        progress = [];
        try
            [file, folder] = uigetfile("*.mat", "Load Orekit Scenario");
            if isequal(file, 0)
                return;
            end
            progress = openProgress("Load Scenario", ...
                "Loading scenario file...", 0.20);
            scenario = loadScenario(fullfile(folder, file));
            updateProgress(progress, 0.55, "Restoring scenario state...");
            selectedKind = "Scenario";
            selectedName = "";
            selectedParentName = "";
            lastAccessResult = [];
            lastSensorAccessResult = [];
            taskList = {};
            lastTaskCandidates = [];
            lastTaskConflicts = [];
            lastTaskSchedule = [];
            restoreTaskProductsFromScenario();
            updateScenarioControls();
            updateProgress(progress, 0.80, "Updating object browser and views...");
            refreshAll();
            setTextArea(objectInfoText, "Loaded scenario: " + string(fullfile(folder, file)));
            finishProgress(progress, "Scenario loaded.");
        catch err
            closeProgress(progress);
            uialert(fig, getReport(err, "extended", "hyperlinks", "off"), ...
                "Could not load scenario");
        end
    end

    function closeScenarioCallback(~, ~)
        scenario = MissionScenario(defaultScenarioConfig());
        selectedKind = "Scenario";
        selectedName = "";
        selectedParentName = "";
        lastAccessResult = [];
        lastSensorAccessResult = [];
        taskList = {};
        lastTaskCandidates = [];
        lastTaskConflicts = [];
        lastTaskSchedule = [];
        updateScenarioControls();
        refreshAll();
        setStatus("Scenario closed", [0.35 0.35 0.35]);
    end

    function closeApp(~, ~)
        deleteAnimationTimer();
        delete(fig);
    end

    function updateScenarioControls()
        cfg = scenario.Config;
        if ~isUtcDatetime(cfg.Epoch)
            cfg.Epoch.TimeZone = "UTC";
            scenario.Config = cfg;
        end
        scenarioNameEdit.Value = char(cfg.Name);
        epochEdit.Value = formatUtc(cfg.Epoch);
        durationHoursEdit.Value = hours(cfg.getStopTime() - cfg.Epoch);
        timeStepEdit.Value = seconds(cfg.TimeStep);
        if ~isempty(animationStepEdit) && isvalid(animationStepEdit)
            animationStepEdit.Value = seconds(cfg.AnimationStep);
        end
        stopTimeValue.Text = formatUtc(cfg.getStopTime());
        scenario.CurrentAnimationTime = clampScenarioTime(scenario.CurrentAnimationTime, cfg);
        scenarioTimeEdit.Value = formatUtc(scenario.CurrentAnimationTime);

        durationSeconds = max(seconds(cfg.getStopTime() - cfg.Epoch), 1);
        timeSlider.Limits = [0 durationSeconds];
        timeSlider.Value = max(0, min(durationSeconds, ...
            seconds(scenario.CurrentAnimationTime - cfg.Epoch)));
        timeSlider.MajorTicks = unique(round(linspace(0, durationSeconds, 5)));
    end

    function refreshAccessDropdowns()
        if isempty(accessSourceDrop) || ~isvalid(accessSourceDrop)
            return;
        end

        names = objectNames();
        if isempty(names)
            items = {'<none>'};
        else
            items = cellstr(names).';
        end

        oldSource = string(accessSourceDrop.Value);
        oldTarget = string(accessTargetDrop.Value);
        accessSourceDrop.Items = items;
        accessTargetDrop.Items = items;

        accessSourceDrop.Value = chooseDropdownValue(items, oldSource, 1);
        accessTargetDrop.Value = chooseDropdownValue(items, oldTarget, min(2, numel(items)));
    end

    function refreshSensorDropdowns()
        if isempty(sensorParentDrop) || ~isvalid(sensorParentDrop)
            return;
        end

        parentItems = sensorParentItems();
        targetItems = objectItemsOrNone();
        oldParent = string(sensorParentDrop.Value);
        oldSensor = string(sensorDrop.Value);
        oldTarget = string(sensorTargetDrop.Value);

        sensorParentDrop.Items = parentItems;
        sensorParentDrop.Value = chooseDropdownValue(parentItems, oldParent, 1);
        sensorItems = sensorItemsForParent(sensorParentDrop.Value);
        sensorDrop.Items = sensorItems;
        sensorDrop.Value = chooseDropdownValue(sensorItems, oldSensor, 1);
        sensorTargetDrop.Items = targetItems;
        sensorTargetDrop.Value = chooseDropdownValue(targetItems, oldTarget, min(2, numel(targetItems)));
    end

    function refreshAnalysisDropdowns()
        if isempty(analysisSatelliteDrop) || ~isvalid(analysisSatelliteDrop)
            return;
        end

        satItems = satelliteItemsOrNone();
        old = string(analysisSatelliteDrop.Value);
        analysisSatelliteDrop.Items = satItems;
        analysisSatelliteDrop.Value = chooseDropdownValue(satItems, old, 1);

        stationNames = strings(0, 1);
        for k = 1:numel(scenario.Objects)
            if isa(scenario.Objects{k}, "GroundStationObject")
                stationNames(end + 1, 1) = string(scenario.Objects{k}.Name); %#ok<AGROW>
            end
        end
        if isempty(stationNames)
            stationItems = {'<none>'};
        else
            stationItems = cellstr(stationNames).';
        end
        old = string(analysisStationDrop.Value);
        analysisStationDrop.Items = stationItems;
        analysisStationDrop.Value = chooseDropdownValue(stationItems, old, 1);
    end

    function refreshTaskingDropdowns()
        targetItems = objectItemsOrNone();
        sensorItems = sensorFlatItems();
        areaItems = areaTargetItems();
        satelliteItems = satelliteItemsOrNone();

        if ~isempty(taskTargetDrop) && isvalid(taskTargetDrop)
            old = string(taskTargetDrop.Value);
            taskTargetDrop.Items = targetItems;
            taskTargetDrop.Value = chooseDropdownValue(targetItems, old, 1);
        end
        if ~isempty(taskSensorDrop) && isvalid(taskSensorDrop)
            old = string(taskSensorDrop.Value);
            taskSensorDrop.Items = sensorItems;
            taskSensorDrop.Value = chooseDropdownValue(sensorItems, old, 1);
        end
        if ~isempty(coverageTargetDrop) && isvalid(coverageTargetDrop)
            old = string(coverageTargetDrop.Value);
            coverageTargetDrop.Items = areaItems;
            coverageTargetDrop.Value = chooseDropdownValue(areaItems, old, 1);
        end
        if ~isempty(viewerSatelliteDrop) && isvalid(viewerSatelliteDrop)
            old = string(viewerSatelliteDrop.Value);
            viewerSatelliteDrop.Items = satelliteItems;
            viewerSatelliteDrop.Value = chooseDropdownValue(satelliteItems, old, 1);
            refreshViewerSensorDropdown();
        end
    end

    function refreshViewerSensorDropdown()
        if isempty(viewerSensorDrop) || ~isvalid(viewerSensorDrop)
            return;
        end
        if isempty(viewerSatelliteDrop) || ~isvalid(viewerSatelliteDrop)
            return;
        end
        sensorItems = sensorItemsForParent(viewerSatelliteDrop.Value);
        if isscalar(sensorItems) && strcmp(sensorItems{1}, "<none>")
            items = {'<all>'};
        else
            items = [{'<all>'}, sensorItems];
        end
        old = string(viewerSensorDrop.Value);
        viewerSensorDrop.Items = items;
        viewerSensorDrop.Value = chooseDropdownValue(items, old, 1);
    end

    function items = sensorParentItems()
        names = strings(0, 1);
        for k = 1:numel(scenario.Objects)
            obj = scenario.Objects{k};
            if isprop(obj, "Sensors")
                names(end + 1, 1) = obj.Name; %#ok<AGROW>
            end
        end
        if isempty(names)
            items = {'<none>'};
        else
            items = cellstr(names).';
        end
    end

    function items = sensorItemsForParent(parentName)
        parentName = string(parentName);
        if parentName == "<none>" || ~scenario.hasObject(parentName)
            items = {'<none>'};
            return;
        end
        parent = scenario.getObject(parentName);
        if ~isprop(parent, "Sensors") || isempty(parent.Sensors)
            items = {'<none>'};
            return;
        end
        names = strings(numel(parent.Sensors), 1);
        for k = 1:numel(parent.Sensors)
            names(k) = parent.Sensors{k}.Name;
        end
        items = cellstr(names).';
    end

    function items = objectItemsOrNone()
        names = objectNames();
        if isempty(names)
            items = {'<none>'};
        else
            items = cellstr(names).';
        end
    end

    function items = satelliteItemsOrNone()
        names = strings(0, 1);
        for k = 1:numel(scenario.Objects)
            if isa(scenario.Objects{k}, "SatelliteObject")
                names(end + 1, 1) = scenario.Objects{k}.Name; %#ok<AGROW>
            end
        end
        if isempty(names)
            items = {'<none>'};
        else
            items = cellstr(names).';
        end
    end

    function items = areaTargetItems()
        names = strings(0, 1);
        for k = 1:numel(scenario.Objects)
            if isa(scenario.Objects{k}, "AreaTargetObject")
                names(end + 1, 1) = scenario.Objects{k}.Name; %#ok<AGROW>
            end
        end
        if isempty(names)
            items = {'<none>'};
        else
            items = cellstr(names).';
        end
    end

    function items = sensorFlatItems()
        sensors = scenarioSensorTable(scenario);
        if isempty(sensors) || height(sensors) == 0
            items = {'<any>'};
            return;
        end
        names = unique(sensors.SensorName, "stable");
        items = [{'<any>'}, cellstr(names).'];
    end

    function value = chooseDropdownValue(items, oldValue, preferredIndex)
        if any(strcmp(items, oldValue))
            value = char(oldValue);
            return;
        end
        preferredIndex = max(1, min(preferredIndex, numel(items)));
        value = items{preferredIndex};
    end

    function names = objectNames()
        names = strings(0, 1);
        for k = 1:numel(scenario.Objects)
            names(end + 1, 1) = scenario.Objects{k}.Name; %#ok<AGROW>
        end
    end

    function tf = hasSatellites()
        tf = satelliteCount() > 0;
    end

    function tf = anySatellitesNeedPropagation()
        tf = false;
        for k = 1:numel(scenario.Objects)
            obj = scenario.Objects{k};
            if isa(obj, "SatelliteObject") && (~obj.IsPropagated || isempty(obj.Ephemeris))
                tf = true;
                return;
            end
        end
    end

    function n = satelliteCount()
        n = 0;
        for k = 1:numel(scenario.Objects)
            if isa(scenario.Objects{k}, "SatelliteObject")
                n = n + 1;
            end
        end
    end

    function n = groundStationCount()
        n = 0;
        for k = 1:numel(scenario.Objects)
            if isFixedLocationObject(scenario.Objects{k}) && ...
                    ~isa(scenario.Objects{k}, "TargetObject") && ...
                    ~isa(scenario.Objects{k}, "AreaTargetObject")
                n = n + 1;
            end
        end
    end

    function n = targetCount()
        n = 0;
        for k = 1:numel(scenario.Objects)
            if isa(scenario.Objects{k}, "TargetObject")
                n = n + 1;
            end
        end
    end

    function n = areaTargetCount()
        n = 0;
        for k = 1:numel(scenario.Objects)
            if isa(scenario.Objects{k}, "AreaTargetObject")
                n = n + 1;
            end
        end
    end

    function assertUniqueObjectName(name)
        if scenario.hasObject(name)
            error("OrekitUI:DuplicateName", ...
                "An object named '%s' already exists.", name);
        end
    end

    function assertUniqueGeneratedNames(satellites)
        names = strings(numel(satellites), 1);
        for k = 1:numel(satellites)
            names(k) = satellites{k}.Name;
            assertUniqueObjectName(names(k));
        end
        if numel(unique(names)) ~= numel(names)
            error("OrekitUI:DuplicateGeneratedNames", ...
                "The constellation generated duplicate satellite names.");
        end
    end

    function name = cleanObjectName(value)
        name = char(strtrim(string(value)));
        if isempty(name)
            error("OrekitUI:InvalidName", "Object name cannot be empty.");
        end
    end

    function value = cleanTextareaValue(rawValue)
        value = string(rawValue);
        value = strjoin(strtrim(value(:).'), "");
        value = char(value);
    end

    function name = nextObjectName(prefix)
        idx = 1;
        name = char(prefix + idx);
        while scenario.hasObject(name)
            idx = idx + 1;
            name = char(prefix + idx);
        end
    end

    function name = nextSensorName(parentName, prefix)
        idx = 1;
        name = char(prefix + idx);
        if ~scenario.hasObject(parentName)
            return;
        end
        parent = scenario.getObject(parentName);
        while isprop(parent, "Sensors") && parent.hasSensor(name)
            idx = idx + 1;
            name = char(prefix + idx);
        end
    end

    function values = parseNumericVector(text, expectedLength)
        pieces = split(strrep(string(text), ";", ","), ",");
        pieces = strtrim(pieces);
        pieces(pieces == "") = [];
        if numel(pieces) ~= expectedLength
            error("OrekitUI:InvalidNumericVector", ...
                "Expected %d comma-separated numeric values.", expectedLength);
        end
        values = zeros(1, expectedLength);
        for k = 1:expectedLength
            if strcmpi(pieces(k), "inf") || strcmpi(pieces(k), "+inf")
                values(k) = Inf;
            elseif strcmpi(pieces(k), "-inf")
                values(k) = -Inf;
            else
                values(k) = str2double(pieces(k));
            end
        end
        if any(isnan(values))
            error("OrekitUI:InvalidNumericVector", ...
                "Numeric vector contains a value MATLAB could not parse.");
        end
    end

    function tf = isFixedLocationObject(obj)
        tf = isprop(obj, "LatitudeDeg") && isprop(obj, "LongitudeDeg") && ...
            isprop(obj, "AltitudeMeters");
    end

    function time = parseUtcDatetime(value)
        text = char(strtrim(string(value)));
        formats = ["yyyy-MM-dd'T'HH:mm:ss.SSS", ...
            "yyyy-MM-dd'T'HH:mm:ss", ...
            "yyyy-MM-dd HH:mm:ss", ...
            "yyyy-MM-dd"];

        for k = 1:numel(formats)
            try
                time = datetime(text, "InputFormat", formats(k), "TimeZone", "UTC");
                if ~isnat(time)
                    return;
                end
            catch
            end
        end

        try
            time = datetime(text, "TimeZone", "UTC");
            if ~isnat(time)
                return;
            end
        catch
        end

        error("OrekitUI:InvalidDateTime", ...
            "Use a UTC time like 2026-01-01T00:00:00.");
    end

    function text = formatUtc(time)
        if isempty(time) || any(isnat(time), "all")
            text = "";
            return;
        end
        time.TimeZone = "UTC";
        text = char(time, "yyyy-MM-dd'T'HH:mm:ss");
    end

    function tf = isUtcDatetime(value)
        tf = isdatetime(value) && ~isempty(value.TimeZone) && value.TimeZone == "UTC";
    end

    function time = clampScenarioTime(time, cfg)
        time.TimeZone = "UTC";
        if time < cfg.Epoch
            time = cfg.Epoch;
        end
        stopTime = cfg.getStopTime();
        if time > stopTime
            time = stopTime;
        end
    end

    function label = scenarioDurationLabel()
        duration = scenario.Config.getStopTime() - scenario.Config.Epoch;
        totalSeconds = seconds(duration);
        if totalSeconds >= 86400
            label = sprintf("%.3f day(s)", totalSeconds / 86400.0);
        elseif totalSeconds >= 3600
            label = sprintf("%.3f hour(s)", totalSeconds / 3600.0);
        elseif totalSeconds >= 60
            label = sprintf("%.3f minute(s)", totalSeconds / 60.0);
        else
            label = sprintf("%.3f second(s)", totalSeconds);
        end
    end

    function idx = nearestSampleIndex(times, time)
        [~, idx] = min(abs(times - time));
    end

    function [lonOut, latOut] = splitDateline(lon, lat)
        lonOut = lon(:);
        latOut = lat(:);
        jumps = [false; abs(diff(lonOut)) > 180];
        lonOut(jumps) = NaN;
        latOut(jumps) = NaN;
    end

    function [x, y, z] = latLonToSphere(latDeg, lonDeg, radiusKm)
        x = radiusKm .* cosd(latDeg) .* cosd(lonDeg);
        y = radiusKm .* cosd(latDeg) .* sind(lonDeg);
        z = radiusKm .* sind(latDeg);
    end

    function [x, y, z] = geodeticToCartesian(latDeg, lonDeg, altKm)
        radiusKm = 6378.137 + altKm;
        [x, y, z] = latLonToSphere(latDeg, lonDeg, radiusKm);
    end

    function frameName = current3DFrame()
        if isempty(frame3DDrop) || ~isvalid(frame3DDrop)
            frameName = "ECEF";
            return;
        end
        frameName = string(frame3DDrop.Value);
    end

    function label = frameMotionLabel(frameName)
        if frameName == "ECI"
            label = " - Earth rotating";
        else
            label = " - Earth fixed";
        end
    end

    function [xKm, yKm, zKm] = satellitePathKm(eph, frameName)
        if frameName == "ECI"
            xKm = eph.X_m / 1000.0;
            yKm = eph.Y_m / 1000.0;
            zKm = eph.Z_m / 1000.0;
        else
            xKm = eph.ECEF_X_m / 1000.0;
            yKm = eph.ECEF_Y_m / 1000.0;
            zKm = eph.ECEF_Z_m / 1000.0;
        end
    end

    function positionKm = satellitePositionKmAtTime(satellite, frameName)
        if frameName == "ECI"
            positionKm = satellite.getECI(scenario.CurrentAnimationTime) / 1000.0;
        else
            positionKm = satellite.getECEF(scenario.CurrentAnimationTime) / 1000.0;
        end
        positionKm = reshape(positionKm, 1, 3);
    end

    function thetaRad = earthRotationAngle(time)
        earthRateRadPerSec = 7.2921150e-5;
        thetaRad = mod(earthRateRadPerSec * seconds(time - scenario.Config.Epoch), 2 * pi);
    end

    function [xView, yView, zView] = earthFixedToViewFrame(x, y, z, frameName, thetaRad)
        if frameName == "ECI"
            shape = size(x);
            ecefKm = [x(:), y(:), z(:)];
            try
                gcrfKm = OrekitFrameTransform.ecefToGcrf( ...
                    scenario.CurrentAnimationTime, ecefKm * 1000.0) / 1000.0;
            catch
                c = cos(thetaRad);
                s = sin(thetaRad);
                gcrfKm = [c .* ecefKm(:, 1) - s .* ecefKm(:, 2), ...
                    s .* ecefKm(:, 1) + c .* ecefKm(:, 2), ecefKm(:, 3)];
            end
            xView = reshape(gcrfKm(:, 1), shape);
            yView = reshape(gcrfKm(:, 2), shape);
            zView = reshape(gcrfKm(:, 3), shape);
        else
            xView = x;
            yView = y;
            zView = z;
        end
    end

    function limits = clampWindow(center, width, minValue, maxValue)
        halfWidth = width / 2;
        low = max(minValue, center - halfWidth);
        high = min(maxValue, center + halfWidth);
        if high - low < width && low == minValue
            high = min(maxValue, low + width);
        elseif high - low < width && high == maxValue
            low = max(minValue, high - width);
        end
        limits = [low high];
    end

    function expandNode(node)
        try
            expand(node);
        catch
        end
    end

    function progress = openProgress(titleText, messageText, value)
        updateStatusForProgress(messageText);
        try
            progress = uiprogressdlg(fig, ...
                "Title", char(titleText), ...
                "Message", char(messageText), ...
                "Value", progressValue(0, 1, value), ...
                "Indeterminate", "off", ...
                "Cancelable", "off");
        catch
            progress = [];
        end
        drawnow limitrate;
    end

    function updateProgress(progress, value, messageText)
        updateStatusForProgress(messageText);
        if ~isempty(progress)
            try
                if isvalid(progress)
                    progress.Value = progressValue(0, 1, value);
                    progress.Message = char(messageText);
                end
            catch
            end
        end
        drawnow limitrate;
    end

    function finishProgress(progress, messageText)
        updateProgress(progress, 1.0, messageText);
        pause(0.08);
        closeProgress(progress);
    end

    function closeProgress(progress)
        if ~isempty(progress)
            try
                if isvalid(progress)
                    close(progress);
                end
            catch
                try
                    delete(progress);
                catch
                end
            end
        end
        drawnow limitrate;
    end

    function value = progressValue(startValue, endValue, fraction)
        value = startValue + (endValue - startValue) * fraction;
        value = min(1.0, max(0.0, value));
    end

    function updateStatusForProgress(messageText)
        setStatus(messageText, [0.10 0.32 0.58]);
    end

    function setTextArea(control, lines)
        if isempty(control) || ~isvalid(control)
            return;
        end
        if ischar(lines)
            control.Value = {lines};
        elseif isstring(lines)
            control.Value = cellstr(lines(:));
        elseif iscell(lines)
            control.Value = lines(:);
        else
            control.Value = cellstr(string(lines(:)));
        end
    end

    function setStatus(text, color)
        if isempty(statusLabel) || ~isvalid(statusLabel)
            return;
        end
        statusLabel.Text = char(text);
        statusLabel.FontColor = color;
    end
end
