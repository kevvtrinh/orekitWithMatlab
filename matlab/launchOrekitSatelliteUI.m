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
stopTimeValue = [];
scenarioTimeEdit = [];
timeSlider = [];
jarEdit = [];
dataEdit = [];
objectTree = [];
viewTabs = [];
mapTab = [];
globeTab = [];
mapAxes = [];
globeAxes = [];
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
sensorTab = uitab(ribbon, "Title", "Sensors / Payloads");
ribbon.SelectedTab = insertTab;

buildScenarioRibbon(scenarioTab);
buildInsertRibbon(insertTab);
buildViewRibbon(viewTab);
buildSensorsRibbon(sensorTab);

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

        btn = uibutton(grid, "Text", "Save", "ButtonPushedFcn", @saveScenarioCallback);
        btn.Layout.Row = 1;
        btn.Layout.Column = 1;
        btn = uibutton(grid, "Text", "Load", "ButtonPushedFcn", @loadScenarioCallback);
        btn.Layout.Row = 1;
        btn.Layout.Column = 2;
        btn = uibutton(grid, "Text", "Close", "ButtonPushedFcn", @closeScenarioCallback);
        btn.Layout.Row = 1;
        btn.Layout.Column = 3;

        lbl = uilabel(grid, "Text", "Name");
        lbl.Layout.Row = 1;
        lbl.Layout.Column = 5;
        scenarioNameEdit = uieditfield(grid, "text", ...
            "ValueChangedFcn", @applyScenarioConfigCallback);
        scenarioNameEdit.Layout.Row = 1;
        scenarioNameEdit.Layout.Column = 6;

        lbl = uilabel(grid, "Text", "Epoch UTC");
        lbl.Layout.Row = 1;
        lbl.Layout.Column = 7;
        epochEdit = uieditfield(grid, "text", ...
            "ValueChangedFcn", @applyScenarioConfigCallback);
        epochEdit.Layout.Row = 1;
        epochEdit.Layout.Column = 8;

        lbl = uilabel(grid, "Text", "Duration h");
        lbl.Layout.Row = 1;
        lbl.Layout.Column = 9;
        durationHoursEdit = uieditfield(grid, "numeric", ...
            "Limits", [0.001 Inf], "ValueChangedFcn", @applyScenarioConfigCallback);
        durationHoursEdit.Layout.Row = 1;
        durationHoursEdit.Layout.Column = 10;

        propagateButton = uibutton(grid, "Text", "Apply / Propagate", ...
            "ButtonPushedFcn", @applyScenarioConfigCallback);
        propagateButton.Layout.Row = [1 2];
        propagateButton.Layout.Column = 12;

        lbl = uilabel(grid, "Text", "Step s");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 5;
        timeStepEdit = uieditfield(grid, "numeric", ...
            "Limits", [0.001 Inf], "ValueChangedFcn", @applyScenarioConfigCallback);
        timeStepEdit.Layout.Row = 2;
        timeStepEdit.Layout.Column = 6;

        lbl = uilabel(grid, "Text", "Stop UTC");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 7;
        stopTimeValue = uilabel(grid, "Text", "");
        stopTimeValue.Layout.Row = 2;
        stopTimeValue.Layout.Column = 8;

        lbl = uilabel(grid, "Text", "Scenario UTC");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 9;
        scenarioTimeEdit = uieditfield(grid, "text", ...
            "ValueChangedFcn", @scenarioTimeChanged);
        scenarioTimeEdit.Layout.Row = 2;
        scenarioTimeEdit.Layout.Column = [10 11];

        lbl = uilabel(grid, "Text", "JAR folder");
        lbl.Layout.Row = 3;
        lbl.Layout.Column = 1;
        jarEdit = uieditfield(grid, "text", "Value", defaultJarRoot);
        jarEdit.Layout.Row = 3;
        jarEdit.Layout.Column = [2 6];
        btn = uibutton(grid, "Text", "Browse", "ButtonPushedFcn", @browseJarRoot);
        btn.Layout.Row = 3;
        btn.Layout.Column = 7;

        lbl = uilabel(grid, "Text", "Data");
        lbl.Layout.Row = 3;
        lbl.Layout.Column = 8;
        dataEdit = uieditfield(grid, "text", "Value", defaultDataRoot);
        dataEdit.Layout.Row = 3;
        dataEdit.Layout.Column = [9 10];
        btn = uibutton(grid, "Text", "Browse", "ButtonPushedFcn", @browseDataRoot);
        btn.Layout.Row = 3;
        btn.Layout.Column = 11;
        btn = uibutton(grid, "Text", "Configure", ...
            "ButtonPushedFcn", @configureOrekitCallback);
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
            "ButtonPushedFcn", @openSatelliteDialog);
        btn.Layout.Row = 1;
        btn.Layout.Column = 1;
        lbl = uilabel(grid, "Text", "Orbit object", ...
            "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 1;

        btn = uibutton(grid, "Text", "Place", ...
            "ButtonPushedFcn", @openPlaceDialog);
        btn.Layout.Row = 1;
        btn.Layout.Column = 2;
        lbl = uilabel(grid, "Text", "Earth object", ...
            "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Constellation", ...
            "ButtonPushedFcn", @openConstellationDialog);
        btn.Layout.Row = 1;
        btn.Layout.Column = 3;
        lbl = uilabel(grid, "Text", "Orbit group", ...
            "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 3;

        btn = uibutton(grid, "Text", "Propagate", ...
            "ButtonPushedFcn", @propagateScenarioCallback);
        btn.Layout.Row = 1;
        btn.Layout.Column = 5;

        btn = uibutton(grid, "Text", "Access", ...
            "ButtonPushedFcn", @computeAccessCallback);
        btn.Layout.Row = 1;
        btn.Layout.Column = 6;

        btn = uibutton(grid, "Text", "Focus", ...
            "ButtonPushedFcn", @focusSelectedObject);
        btn.Layout.Row = 1;
        btn.Layout.Column = 7;

        btn = uibutton(grid, "Text", "Export", ...
            "ButtonPushedFcn", @exportToWorkspace);
        btn.Layout.Row = 1;
        btn.Layout.Column = 9;

        btn = uibutton(grid, "Text", "Configure", ...
            "ButtonPushedFcn", @configureOrekitCallback);
        btn.Layout.Row = 1;
        btn.Layout.Column = 11;
    end

    function buildViewRibbon(parent)
        grid = uigridlayout(parent, [2 14]);
        grid.RowHeight = {56, 22};
        grid.ColumnWidth = {102, 102, 90, 14, 112, 92, 76, 96, 82, 82, 82, 96, 104, "1x"};
        grid.Padding = [10 8 10 6];
        grid.ColumnSpacing = 8;

        btn = uibutton(grid, "Text", "2D Window", ...
            "ButtonPushedFcn", @(~, ~) selectView(mapTab));
        btn.Layout.Row = 1;
        btn.Layout.Column = 1;

        btn = uibutton(grid, "Text", "3D Window", ...
            "ButtonPushedFcn", @(~, ~) selectView(globeTab));
        btn.Layout.Row = 1;
        btn.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Refresh", ...
            "ButtonPushedFcn", @refreshViewsCallback);
        btn.Layout.Row = 1;
        btn.Layout.Column = 3;

        showTrackCheck = uicheckbox(grid, "Text", "Ground tracks", ...
            "Value", true, "ValueChangedFcn", @refreshViewsCallback);
        showTrackCheck.Layout.Row = 1;
        showTrackCheck.Layout.Column = 5;

        showOrbitCheck = uicheckbox(grid, "Text", "3D paths", ...
            "Value", true, "ValueChangedFcn", @refreshViewsCallback);
        showOrbitCheck.Layout.Row = 1;
        showOrbitCheck.Layout.Column = 6;

        showPlacesCheck = uicheckbox(grid, "Text", "Places", ...
            "Value", true, "ValueChangedFcn", @refreshViewsCallback);
        showPlacesCheck.Layout.Row = 1;
        showPlacesCheck.Layout.Column = 7;

        frame3DDrop = uidropdown(grid, "Items", {'ECEF', 'ECI'}, ...
            "Value", "ECEF", "ValueChangedFcn", @refreshViewsCallback);
        frame3DDrop.Layout.Row = 1;
        frame3DDrop.Layout.Column = 8;
        frameLabel = uilabel(grid, "Text", "3D frame", ...
            "HorizontalAlignment", "center");
        frameLabel.Layout.Row = 2;
        frameLabel.Layout.Column = 8;

        btn = uibutton(grid, "Text", "Start", ...
            "ButtonPushedFcn", @startAnimation);
        btn.Layout.Row = 1;
        btn.Layout.Column = 9;

        btn = uibutton(grid, "Text", "Stop", ...
            "ButtonPushedFcn", @stopAnimation);
        btn.Layout.Row = 1;
        btn.Layout.Column = 10;

        btn = uibutton(grid, "Text", "Reset", ...
            "ButtonPushedFcn", @resetAnimation);
        btn.Layout.Row = 1;
        btn.Layout.Column = 11;

        btn = uibutton(grid, "Text", "Step Back", ...
            "ButtonPushedFcn", @(~, ~) stepScenarioTime(-1));
        btn.Layout.Row = 1;
        btn.Layout.Column = 12;

        btn = uibutton(grid, "Text", "Step Forward", ...
            "ButtonPushedFcn", @(~, ~) stepScenarioTime(1));
        btn.Layout.Row = 1;
        btn.Layout.Column = 13;
    end

    function buildSensorsRibbon(parent)
        grid = uigridlayout(parent, [2 12]);
        grid.RowHeight = {56, 22};
        grid.ColumnWidth = {150, 150, 150, 14, 104, 104, 126, 112, 112, 112, "1x", 116};
        grid.Padding = [10 8 10 6];
        grid.ColumnSpacing = 8;

        sensorParentDrop = uidropdown(grid, "Items", {'<none>'}, ...
            "ValueChangedFcn", @sensorParentChanged);
        sensorParentDrop.Layout.Row = 1;
        sensorParentDrop.Layout.Column = 1;
        lbl = uilabel(grid, "Text", "Parent object", ...
            "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 1;

        sensorDrop = uidropdown(grid, "Items", {'<none>'});
        sensorDrop.Layout.Row = 1;
        sensorDrop.Layout.Column = 2;
        lbl = uilabel(grid, "Text", "Sensor", ...
            "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 2;

        sensorTargetDrop = uidropdown(grid, "Items", {'<none>'});
        sensorTargetDrop.Layout.Row = 1;
        sensorTargetDrop.Layout.Column = 3;
        lbl = uilabel(grid, "Text", "Target object", ...
            "HorizontalAlignment", "center");
        lbl.Layout.Row = 2;
        lbl.Layout.Column = 3;

        btn = uibutton(grid, "Text", "Add Sensor", ...
            "ButtonPushedFcn", @openSensorDialog);
        btn.Layout.Row = 1;
        btn.Layout.Column = 5;

        btn = uibutton(grid, "Text", "Delete", ...
            "ButtonPushedFcn", @deleteSensorCallback);
        btn.Layout.Row = 1;
        btn.Layout.Column = 6;

        btn = uibutton(grid, "Text", "Compute Access", ...
            "ButtonPushedFcn", @computeSensorAccessCallback);
        btn.Layout.Row = 1;
        btn.Layout.Column = 7;

        btn = uibutton(grid, "Text", "Timeline", ...
            "ButtonPushedFcn", @plotSensorTimelineCallback);
        btn.Layout.Row = 1;
        btn.Layout.Column = 8;

        btn = uibutton(grid, "Text", "Off-Boresight", ...
            "ButtonPushedFcn", @plotOffBoresightCallback);
        btn.Layout.Row = 1;
        btn.Layout.Column = 9;

        btn = uibutton(grid, "Text", "Range", ...
            "ButtonPushedFcn", @plotSensorRangeCallback);
        btn.Layout.Row = 1;
        btn.Layout.Column = 10;

        btn = uibutton(grid, "Text", "Export Report", ...
            "ButtonPushedFcn", @exportSensorAccessCallback);
        btn.Layout.Row = 1;
        btn.Layout.Column = 12;
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
            "ButtonPushedFcn", @deleteSelectedObject);
        btn.Layout.Row = 2;
    end

    function buildGraphicsArea(parent)
        viewTabs = uitabgroup(parent);
        viewTabs.Layout.Column = 2;
        mapTab = uitab(viewTabs, "Title", "2D Graphics");
        globeTab = uitab(viewTabs, "Title", "3D Graphics");
        viewTabs.SelectedTab = mapTab;

        grid = uigridlayout(mapTab, [2 1]);
        grid.RowHeight = {"1x", 34};
        grid.Padding = [4 4 4 4];
        mapAxes = uiaxes(grid);
        mapAxes.Layout.Row = 1;
        timeSlider = uislider(grid, "ValueChangedFcn", @timeSliderChanged);
        timeSlider.Layout.Row = 2;

        grid = uigridlayout(globeTab, [1 1]);
        grid.Padding = [4 4 4 4];
        globeAxes = uiaxes(grid);
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

        objectInfoText = uitextarea(grid, "Editable", "off");
        objectInfoText.Layout.Row = 2;
        objectInfoText.Layout.Column = [1 2];

        lbl = uilabel(grid, "Text", "Access", "FontWeight", "bold");
        lbl.Layout.Row = 3;
        lbl.Layout.Column = [1 2];

        lbl = uilabel(grid, "Text", "Source");
        lbl.Layout.Row = 4;
        lbl.Layout.Column = 1;
        accessSourceDrop = uidropdown(grid, "Items", {'<none>'});
        accessSourceDrop.Layout.Row = 4;
        accessSourceDrop.Layout.Column = 2;

        lbl = uilabel(grid, "Text", "Target");
        lbl.Layout.Row = 5;
        lbl.Layout.Column = 1;
        accessTargetDrop = uidropdown(grid, "Items", {'<none>'});
        accessTargetDrop.Layout.Row = 5;
        accessTargetDrop.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Compute Access", ...
            "ButtonPushedFcn", @computeAccessCallback);
        btn.Layout.Row = 6;
        btn.Layout.Column = [1 2];

        lbl = uilabel(grid, "Text", "Results", "FontWeight", "bold");
        lbl.Layout.Row = 7;
        lbl.Layout.Column = [1 2];

        accessSummaryText = uitextarea(grid, "Editable", "off");
        accessSummaryText.Layout.Row = 8;
        accessSummaryText.Layout.Column = [1 2];

        btn = uibutton(grid, "Text", "Export Scenario To Workspace", ...
            "ButtonPushedFcn", @exportToWorkspace);
        btn.Layout.Row = 9;
        btn.Layout.Column = [1 2];

        btn = uibutton(grid, "Text", "Export Ephemeris CSVs", ...
            "ButtonPushedFcn", @exportEphemerisCallback);
        btn.Layout.Row = 10;
        btn.Layout.Column = [1 2];

        statusLabel = uilabel(grid, "Text", "Orekit not configured", ...
            "FontColor", [0.55 0.18 0.08]);
        statusLabel.Layout.Row = 11;
        statusLabel.Layout.Column = [1 2];
    end

    function cfg = defaultScenarioConfig()
        cfg = ScenarioConfig("Name", "Untitled Scenario", ...
            "Epoch", datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC"), ...
            "Duration", hours(24), ...
            "TimeStep", seconds(60), ...
            "AnimationStep", seconds(60), ...
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
        if durationHours <= 0 || stepSeconds <= 0
            error("OrekitUI:InvalidScenarioTime", ...
                "Duration and time step must be positive.");
        end

        name = string(strtrim(scenarioNameEdit.Value));
        if strlength(name) == 0
            error("OrekitUI:InvalidScenarioName", "Scenario name cannot be empty.");
        end

        cfg = ScenarioConfig("Name", name, ...
            "Epoch", epoch, ...
            "Duration", hours(durationHours), ...
            "TimeStep", seconds(stepSeconds), ...
            "AnimationStep", seconds(stepSeconds), ...
            "OutputFrame", "GCRF");
        cfg.validate();
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
        kepGrid = uigridlayout(kepTab, [9 2]);
        kepGrid.RowHeight = repmat({34}, 1, 9);
        kepGrid.ColumnWidth = {170, "1x"};
        kepGrid.Padding = [12 12 12 12];
        kepGrid.RowSpacing = 7;

        uilabel(kepGrid, "Text", "Name");
        kepName = uieditfield(kepGrid, "text", "Value", nextObjectName("Satellite"));
        kepName.Layout.Row = 1;
        kepName.Layout.Column = 2;

        uilabel(kepGrid, "Text", "Semi-major axis km");
        kepSma = uieditfield(kepGrid, "numeric", "Value", 7000, "Limits", [0 Inf]);
        kepSma.Layout.Row = 2;
        kepSma.Layout.Column = 2;

        uilabel(kepGrid, "Text", "Eccentricity");
        kepEcc = uieditfield(kepGrid, "numeric", "Value", 0.001, ...
            "Limits", [0 0.999999]);
        kepEcc.Layout.Row = 3;
        kepEcc.Layout.Column = 2;

        uilabel(kepGrid, "Text", "Inclination deg");
        kepInc = uieditfield(kepGrid, "numeric", "Value", 51.6);
        kepInc.Layout.Row = 4;
        kepInc.Layout.Column = 2;

        uilabel(kepGrid, "Text", "RAAN deg");
        kepRaan = uieditfield(kepGrid, "numeric", "Value", 0);
        kepRaan.Layout.Row = 5;
        kepRaan.Layout.Column = 2;

        uilabel(kepGrid, "Text", "Arg. perigee deg");
        kepArgPerigee = uieditfield(kepGrid, "numeric", "Value", 0);
        kepArgPerigee.Layout.Row = 6;
        kepArgPerigee.Layout.Column = 2;

        uilabel(kepGrid, "Text", "True anomaly deg");
        kepTrueAnomaly = uieditfield(kepGrid, "numeric", "Value", 0);
        kepTrueAnomaly.Layout.Row = 7;
        kepTrueAnomaly.Layout.Column = 2;

        uilabel(kepGrid, "Text", "Mass kg");
        kepMass = uieditfield(kepGrid, "numeric", "Value", 1000, "Limits", [0 Inf]);
        kepMass.Layout.Row = 8;
        kepMass.Layout.Column = 2;

        btn = uibutton(kepGrid, "Text", "Insert Satellite", ...
            "ButtonPushedFcn", @insertKeplerianSatellite);
        btn.Layout.Row = 9;
        btn.Layout.Column = [1 2];

        tleTab = uitab(typeTabs, "Title", "TLE");
        tleGrid = uigridlayout(tleTab, [7 2]);
        tleGrid.RowHeight = {34, 24, 92, 24, 92, 36, "1x"};
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

        btn = uibutton(tleGrid, "Text", "Insert Satellite", ...
            "ButtonPushedFcn", @insertTleSatellite);
        btn.Layout.Row = 6;
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

        uilabel(grid, "Text", "Semi-major axis km");
        smaEdit = uieditfield(grid, "numeric", "Value", 7000, "Limits", [0 Inf]);
        smaEdit.Layout.Row = 6;
        smaEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Eccentricity");
        eccEdit = uieditfield(grid, "numeric", "Value", 0.001, ...
            "Limits", [0 0.999999]);
        eccEdit.Layout.Row = 7;
        eccEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Inclination deg");
        incEdit = uieditfield(grid, "numeric", "Value", 53);
        incEdit.Layout.Row = 8;
        incEdit.Layout.Column = 2;

        uilabel(grid, "Text", "RAAN offset deg");
        raanOffsetEdit = uieditfield(grid, "numeric", "Value", 0);
        raanOffsetEdit.Layout.Row = 9;
        raanOffsetEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Arg. perigee deg");
        argPerigeeEdit = uieditfield(grid, "numeric", "Value", 0);
        argPerigeeEdit.Layout.Row = 10;
        argPerigeeEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Anomaly offset deg");
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

        uilabel(grid, "Text", "Latitude deg");
        latEdit = uieditfield(grid, "numeric", "Value", 38.8339, "Limits", [-90 90]);
        latEdit.Layout.Row = 2;
        latEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Longitude deg");
        lonEdit = uieditfield(grid, "numeric", "Value", -104.8214, "Limits", [-180 180]);
        lonEdit.Layout.Row = 3;
        lonEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Altitude km");
        altEdit = uieditfield(grid, "numeric", "Value", 1.84);
        altEdit.Layout.Row = 4;
        altEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Min elevation deg");
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

    function openSensorDialog(~, ~)
        parentName = string(sensorParentDrop.Value);
        if parentName == "<none>" || strlength(parentName) == 0
            uialert(fig, "Add a satellite or place first, then choose it as the sensor parent.", ...
                "No sensor parent selected");
            return;
        end

        dialog = uifigure("Name", "Add Sensor", "Position", [260 130 460 500]);
        grid = uigridlayout(dialog, [12 2]);
        grid.RowHeight = [{34}, repmat({32}, 1, 9), {38, "1x"}];
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
            "Value", "SimpleConic");
        typeDrop.Layout.Row = 3;
        typeDrop.Layout.Column = 2;

        uilabel(grid, "Text", "Pointing mode");
        pointingDrop = uidropdown(grid, "Items", ...
            {'Nadir', 'FixedVector', 'Targeted', 'VelocityVector'}, ...
            "Value", "Nadir");
        pointingDrop.Layout.Row = 4;
        pointingDrop.Layout.Column = 2;

        uilabel(grid, "Text", "Targeted at");
        targetDrop = uidropdown(grid, "Items", objectItemsOrNone());
        targetDrop.Layout.Row = 5;
        targetDrop.Layout.Column = 2;

        uilabel(grid, "Text", "Cone half-angle deg");
        coneEdit = uieditfield(grid, "numeric", "Value", 20, "Limits", [0 180]);
        coneEdit.Layout.Row = 6;
        coneEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Rect half-angle X deg");
        rectXEdit = uieditfield(grid, "numeric", "Value", 10, "Limits", [0 180]);
        rectXEdit.Layout.Row = 7;
        rectXEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Rect half-angle Y deg");
        rectYEdit = uieditfield(grid, "numeric", "Value", 10, "Limits", [0 180]);
        rectYEdit.Layout.Row = 8;
        rectYEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Boresight ENU/XYZ");
        boresightEdit = uieditfield(grid, "text", "Value", "0,0,1");
        boresightEdit.Layout.Row = 9;
        boresightEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Range km min/max");
        rangeEdit = uieditfield(grid, "text", "Value", "0,Inf");
        rangeEdit.Layout.Row = 10;
        rangeEdit.Layout.Column = 2;

        uilabel(grid, "Text", "Min elevation deg");
        minElEdit = uieditfield(grid, "numeric", "Value", 0, "Limits", [-90 90]);
        minElEdit.Layout.Row = 11;
        minElEdit.Layout.Column = 2;

        btn = uibutton(grid, "Text", "Add Sensor", "ButtonPushedFcn", @addSensorFromDialog);
        btn.Layout.Row = 12;
        btn.Layout.Column = [1 2];

        function addSensorFromDialog(~, ~)
            progress = [];
            try
                progress = openProgress("Add Sensor", "Reading sensor inputs...", 0.10);
                sensorName = cleanObjectName(nameEdit.Value);
                targetName = string(targetDrop.Value);
                boresight = parseNumericVector(boresightEdit.Value, 3);
                rangeValues = parseNumericVector(rangeEdit.Value, 2);

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
                if sensor.PointingMode == "Targeted"
                    if targetName == "<none>"
                        error("OrekitUI:MissingSensorTarget", ...
                            "Targeted pointing requires a target object.");
                    end
                    sensor.CurrentPointingTarget = targetName;
                end
                sensor.BoresightVector = boresight;
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

    function refreshAll()
        updateScenarioControls();
        refreshObjectBrowser();
        refreshAccessDropdowns();
        refreshSensorDropdowns();
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

        selectedNode = scenarioNode;
        for k = 1:numel(scenario.Objects)
            obj = scenario.Objects{k};
            if isa(obj, "SatelliteObject")
                node = uitreenode(satFolder, "Text", char(obj.Name), ...
                    "NodeData", struct("Kind", "Satellite", "Name", char(obj.Name)));
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

        if selectedKind == "GroundStation" && scenario.hasObject(selectedName)
            place = scenario.getObject(selectedName);
            selectedLabel.Text = char(place.Name);
            lines = [
                "Type: Place"
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
            sprintf("Satellites: %d", satelliteCount())
            sprintf("Places: %d", groundStationCount())
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
        hold(mapAxes, "off");
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

            idx = nearestSampleIndex(eph.Time, scenario.CurrentAnimationTime);
            markerSize = 78;
            edgeColor = [1 1 1];
            if selectedKind == "Satellite" && selectedName == string(obj.Name)
                markerSize = 110;
                edgeColor = [0.25 0.03 0.03];
            end
            scatter3(globeAxes, xKm(idx), yKm(idx), zKm(idx), markerSize, ...
                "filled", "MarkerFaceColor", obj.Color, ...
                "MarkerEdgeColor", edgeColor, "LineWidth", 1.1);
            plot3(globeAxes, [0 xKm(idx)], [0 yKm(idx)], [0 zKm(idx)], ...
                "Color", [0.95 0.74 0.18], "LineWidth", 0.8);
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
        elseif selectedKind == "GroundStation" && scenario.hasObject(selectedName)
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
        if selectedKind ~= "Satellite" && selectedKind ~= "GroundStation"
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
        lines = [
            string(result.ParentName) + "/" + string(result.SensorName) + ...
            " -> " + string(result.TargetName)
            sprintf("Windows: %d", height(result.AccessWindows))
            sprintf("Total duration: %.1f min", result.Duration / 60.0)
            sprintf("Max elevation: %.3f deg", result.MaxElevation)
            sprintf("Min range: %.3f km", result.MinRange)
            sprintf("Max off-boresight: %.3f deg", result.MaxOffBoresight)
            ];
        if height(result.AccessWindows) > 0
            firstWindow = result.AccessWindows(1, :);
            lines = [
                lines
                "First start: " + formatUtc(firstWindow.StartTime)
                "First stop: " + formatUtc(firstWindow.StopTime)
                ];
        end
    end

    function lines = accessResultLines(result)
        lines = [
            string(result.SourceName) + " -> " + string(result.TargetName)
            sprintf("Windows: %d", height(result.AccessWindows))
            sprintf("Total duration: %.1f min", result.Duration / 60.0)
            sprintf("Max elevation: %.3f deg", result.MaxElevation)
            sprintf("Min range: %.3f km", result.MinRange)
            ];
        if height(result.AccessWindows) > 0
            firstWindow = result.AccessWindows(1, :);
            lines = [
                lines
                "First start: " + formatUtc(firstWindow.StartTime)
                "First stop: " + formatUtc(firstWindow.StopTime)
                ];
        end
    end

    function exportToWorkspace(~, ~)
        assignin("base", "orekitScenario", scenario);
        if ~isempty(lastAccessResult)
            assignin("base", "orekitAccessResult", lastAccessResult);
        end
        if ~isempty(lastSensorAccessResult)
            assignin("base", "orekitSensorAccessResult", lastSensorAccessResult);
        end
        setTextArea(objectInfoText, [
            "Exported orekitScenario to the base workspace."
            "Latest access results are exported when available."
            ]);
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
            [file, folder] = uiputfile("*.mat", "Save Orekit Scenario", ...
                "orekit-scenario.mat");
            if isequal(file, 0)
                return;
            end
            progress = openProgress("Save Scenario", ...
                "Saving scenario file...", 0.30);
            saveScenario(scenario, fullfile(folder, file));
            updateProgress(progress, 0.90, "Updating scenario status...");
            setTextArea(objectInfoText, "Saved scenario: " + string(fullfile(folder, file)));
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
            if isFixedLocationObject(scenario.Objects{k})
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

    function thetaRad = earthRotationAngle(time)
        earthRateRadPerSec = 7.2921150e-5;
        thetaRad = mod(earthRateRadPerSec * seconds(time - scenario.Config.Epoch), 2 * pi);
    end

    function [xView, yView, zView] = earthFixedToViewFrame(x, y, z, frameName, thetaRad)
        if frameName == "ECI"
            c = cos(thetaRad);
            s = sin(thetaRad);
            xView = c .* x - s .* y;
            yView = s .* x + c .* y;
            zView = z;
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
