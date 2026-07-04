# MATLAB + Orekit Mission Scenario Suite — AI Agent Build Specification

## Core Philosophy

**The UI is not the application. The backend is the application. The UI is only one way to operate the backend.**

Build a MATLAB-based mission analysis suite that uses the Orekit Java library as the astrodynamics backend. The suite should feel conceptually similar to STK, but it must be modular, functionalized, scriptable, testable, and usable both with and without a UI.

The most important requirement:

> Every major feature must work in headless/no-UI mode first.  
> The UI must call the same backend functions/classes used by standalone scripts.  
> No astrodynamics logic, propagation logic, access logic, export logic, or scenario computation logic should live inside App Designer callbacks.

---

# 1. High-Level Goal

Create a MATLAB mission scenario suite where a user can:

- Initialize Orekit from MATLAB.
- Create a scenario.
- Set scenario epoch.
- Set scenario duration or stop time.
- Set scenario time step.
- Add satellites.
- Add ground stations.
- Add sensors/payload placeholders.
- Add communication terminal placeholders.
- Propagate objects.
- Generate ephemeris.
- Convert frames and coordinates.
- Compute access between two objects.
- Compute azimuth/elevation/range.
- Compute contact windows.
- Export contact plans.
- Plot orbits.
- Plot ground tracks.
- Plot access timelines.
- Animate the scenario.
- Save and reload scenario files.
- Run everything from either:
  - MATLAB scripts/functions, or
  - MATLAB App Designer UI.

The first MVP should support:

- One scenario.
- One satellite.
- One ground station.
- Keplerian orbit input.
- Scenario epoch/duration/time step.
- Satellite propagation.
- Ground track.
- Satellite-to-ground-station access.
- Access windows table.
- CSV/MAT export.
- Basic animation.

After that, expand to:

- Multiple satellites.
- Multiple ground stations.
- Satellite-to-satellite access.
- Sensor constraints.
- Slew constraints.
- Communication terminals.
- Capacity/latency/contact-plan exports.
- Scheduler-ready outputs.
- MILP/greedy scheduling integration.
- App Designer UI.

---

# 2. Mandatory Design Rule

The software must support two operating modes.

## 2.1 Headless / No-UI Mode

Everything must be callable from scripts:

```matlab
cfg = ScenarioConfig();
cfg.Name = "Demo Scenario";
cfg.Epoch = datetime(2026,1,1,0,0,0);
cfg.Duration = hours(24);
cfg.TimeStep = seconds(30);

scenario = MissionScenario(cfg);

sat = SatelliteObject.fromKeplerian( ...
    "Sat-1", ...
    semiMajorAxis, eccentricity, inclinationDeg, ...
    raanDeg, argPerigeeDeg, trueAnomalyDeg);

gs = GroundStationObject( ...
    "Denver GS", ...
    latitudeDeg, longitudeDeg, altitudeMeters, minElevationDeg);

scenario = scenario.addObject(sat);
scenario = scenario.addObject(gs);

scenario = scenario.propagate();

accessResult = computeAccess(scenario, "Sat-1", "Denver GS");

plotGroundTrack(scenario, "Sat-1");
plotAccessTimeline(accessResult);

exportContactPlan(accessResult, "contactPlan.csv");
```

## 2.2 UI Mode

The UI must only collect user inputs and call backend functions:

```matlab
% Inside App Designer callback:
cfg = app.readScenarioConfigFromUI();
scenario = MissionScenario(cfg);

scenario = scenario.addObject(app.readSatelliteFromUI());
scenario = scenario.addObject(app.readGroundStationFromUI());

scenario = scenario.propagate();

accessResult = computeAccess( ...
    scenario, ...
    app.SourceDropDown.Value, ...
    app.TargetDropDown.Value);

app.displayAccessResult(accessResult);
```

## 2.3 Bad Design Examples

Do not do this:

```matlab
% Bad: raw propagation logic inside a button callback
function RunPropagationButtonPushed(app, event)
    % hundreds of Orekit calls here
end
```

Do this instead:

```matlab
function RunPropagationButtonPushed(app, event)
    app.Scenario = app.Scenario.propagate();
    app.refreshObjectStatusTable();
end
```

Do not do this:

```matlab
% Bad: access calculation hidden inside UI file
function ComputeAccessButtonPushed(app, event)
    % direct Orekit access event detection logic here
end
```

Do this instead:

```matlab
function ComputeAccessButtonPushed(app, event)
    result = computeAccess(app.Scenario, sourceName, targetName, options);
    app.displayAccessResult(result);
end
```

---

# 3. Recommended Repository Structure

```text
/matlab-orekit-suite
  /src

    /core
      MissionScenario.m
      ScenarioConfig.m
      ScenarioClock.m
      AnimationController.m
      ScenarioDefaults.m
      ScenarioValidator.m
      ObjectRegistry.m

    /objects
      MissionObject.m
      SatelliteObject.m
      GroundStationObject.m
      SensorObject.m
      TerminalObject.m
      TargetObject.m
      AreaTargetObject.m
      FacilityObject.m

    /orekit
      OrekitInitializer.m
      OrekitEnvironment.m
      OrekitDataManager.m
      OrekitTime.m
      OrekitFrames.m
      OrekitEarthModel.m
      OrekitOrbitFactory.m
      OrekitPropagatorFactory.m
      OrekitStateConverter.m
      OrekitAccessEngine.m
      OrekitEventDetectorFactory.m
      OrekitAttitudeFactory.m
      OrekitTLEFactory.m
      OrekitExceptionHandler.m

    /analysis
      propagateScenario.m
      propagateObject.m
      computeAccess.m
      computeAccessWindows.m
      computeAzElRange.m
      computeLineOfSight.m
      computeSatToSatAccess.m
      computeSatToGroundAccess.m
      computeGroundToSatAccess.m
      computeVisibilityMask.m
      computeLightingConditions.m
      computeEclipseIntervals.m
      computePassMetrics.m
      summarizeAccess.m
      buildContactPlan.m
      mergeContactWindows.m
      filterContactWindows.m

    /visualization
      plotOrbit3D.m
      plotGroundTrack.m
      plotGroundStations.m
      plotAccessTimeline.m
      plotElevationProfile.m
      plotAzElRange.m
      plotContactGantt.m
      plotConstellation3D.m
      plotScenario2D.m
      animateScenario.m
      drawEarth.m
      updateAnimationFrame.m

    /io
      saveScenario.m
      loadScenario.m
      exportScenarioConfig.m
      importScenarioConfig.m
      exportEphemeris.m
      exportAccessReport.m
      exportContactPlan.m
      exportAzElRange.m
      exportObjectCatalog.m
      exportAnimationFrames.m
      readTLEFile.m
      writeReportMarkdown.m
      writeReportHTML.m

    /ui
      MissionScenarioApp.mlapp
      UIAdapters.m
      UIStateManager.m
      UIValidation.m
      UIPlotBridge.m

    /utils
      datetimeToOrekit.m
      orekitToDatetime.m
      durationToSeconds.m
      normalizeAngleDeg.m
      validateName.m
      validateTimeVector.m
      tableHasColumns.m
      makeUniqueName.m
      safeFilename.m

    /tests
      testScenarioConfig.m
      testMissionScenario.m
      testObjectRegistry.m
      testSatelliteObject.m
      testGroundStationObject.m
      testPropagation.m
      testAccess.m
      testContactPlan.m
      testExports.m
      testAnimationController.m
      testHeadlessExamples.m

  /examples
    /headless
    /ui
    /validation
    /reports

  /docs
    architecture.md
    backend_api.md
    ui_design.md
    orekit_setup.md
    standalone_scripts.md
    access_model.md
    animation_model.md
    contact_plan_schema.md
    future_roadmap.md

  /data
    /orekit-data
    /tle
    /scenarios
    /exports
    /reports

  startupOrekitSuite.m
  runAllTests.m
  README.md
```

---

# 4. Backend Class Design

## 4.1 ScenarioConfig

Create a `ScenarioConfig` class that stores scenario settings only.

Required properties:

```matlab
Name
Epoch
StopTime
Duration
TimeStep
CentralBody
EarthModel
TimeScale
InputFrame
OutputFrame
AnimationStep
DefaultPropagatorType
DefaultMinElevationDeg
Metadata
```

Required methods:

```matlab
validate()
getTimeVector()
getStopTime()
getDuration()
setDuration(durationValue)
setStopTime(stopTimeValue)
toStruct()
fromStruct()
copy()
```

Behavior:

- The user may define either `StopTime` or `Duration`.
- If `Duration` is defined, compute `StopTime = Epoch + Duration`.
- If `StopTime` is defined, compute `Duration = StopTime - Epoch`.
- `TimeStep` must be positive.
- `Epoch` must be before `StopTime`.
- `getTimeVector()` must return a MATLAB datetime vector.
- No Orekit Java calls should live in `ScenarioConfig`.

---

## 4.2 ScenarioClock

Create a `ScenarioClock` class for scenario time management.

Required properties:

```matlab
Epoch
StartTime
StopTime
CurrentTime
TimeStep
AnimationStep
TimeVector
CurrentIndex
```

Required methods:

```matlab
reset()
setTime(time)
stepForward()
stepBackward()
getCurrentTime()
getCurrentIndex()
isAtStart()
isAtEnd()
secondsSinceEpoch(time)
datetimeFromSeconds(secondsFromEpoch)
```

Purpose:

- Decouple scenario time from UI animation time.
- Let both UI and script mode control time consistently.

---

## 4.3 MissionScenario

Create a `MissionScenario` class.

Required properties:

```matlab
Config
Clock
Objects
PropagationResults
AccessResults
ContactPlans
CurrentAnimationTime
Metadata
```

Required methods:

```matlab
addObject(obj)
removeObject(name)
getObject(name)
hasObject(name)
listObjects()
listObjectsByType(objectType)
propagate()
computeAccess(sourceName, targetName, options)
computeAllAccess(options)
buildContactPlan(options)
animate(options)
save(filename)
exportResults(folder)
toStruct()
fromStruct()
validate()
```

Important:

- `MissionScenario` must not depend on App Designer.
- It may call backend functions.
- It should not contain raw Orekit Java calls directly if those calls belong in wrappers.
- Object names must be unique.
- Objects should be retrievable by name.

---

## 4.4 MissionObject Base Class

Create an abstract base class `MissionObject`.

Common properties:

```matlab
Name
ObjectType
Description
Color
IsPropagated
Ephemeris
Metadata
```

Common methods:

```matlab
validate()
getPosition(time, frameName)
getState(time, frameName)
hasEphemeris()
clearEphemeris()
toStruct()
copy()
```

Supported object types:

```text
Satellite
GroundStation
Sensor
Terminal
Target
AreaTarget
Facility
```

---

## 4.5 SatelliteObject

Create a `SatelliteObject` class derived from `MissionObject`.

Required properties:

```matlab
OrbitDefinitionType
KeplerianElements
CartesianState
TLE
PropagatorType
PropagatorSettings
MassKg
AttitudeMode
Sensors
Terminals
OrekitOrbit
OrekitPropagator
```

Required constructors/static methods:

```matlab
fromKeplerian(name, a, e, iDeg, raanDeg, argPerigeeDeg, trueAnomalyDeg)
fromCartesian(name, positionM, velocityMps, epoch)
fromTLE(name, line1, line2)
```

Required methods:

```matlab
buildOrekitOrbit(scenarioConfig)
buildOrekitPropagator(scenarioConfig)
propagate(timeVector, scenarioConfig)
getECI(time)
getECEF(time)
getLLA(time)
plotOrbit()
plotGroundTrack()
addSensor(sensor)
addTerminal(terminal)
```

---

## 4.6 GroundStationObject

Create a `GroundStationObject` class derived from `MissionObject`.

Required properties:

```matlab
LatitudeDeg
LongitudeDeg
AltitudeMeters
MinElevationDeg
AzimuthMask
ElevationMask
AvailabilityWindows
OrekitTopocentricFrame
```

Required methods:

```matlab
buildOrekitTopocentricFrame(scenarioConfig)
getPosition(time, frameName)
computeAzElRangeTo(targetObject, timeVector)
isAvailable(time)
plotLocation()
```

---

## 4.7 SensorObject

Create a `SensorObject` placeholder class.

Required properties:

```matlab
ParentName
SensorType
Boresight
FieldOfViewDeg
FieldOfRegardDeg
MinLookAngleDeg
MaxLookAngleDeg
SlewRateDegPerSec
Constraints
```

Required methods:

```matlab
validate()
canAccessTarget(parentObject, targetObject, timeVector)
computeLookAngles(parentObject, targetObject, timeVector)
```

Initial MVP may only store values. Design it so real sensor constraints can be added later.

---

## 4.8 TerminalObject

Create a `TerminalObject` placeholder class for future communications/scheduling.

Required properties:

```matlab
ParentName
TerminalID
TerminalType
FrequencyBand
DataRateBps
MinElevationDeg
MaxRangeKm
SlewRateDegPerSec
CurrentTarget
AvailabilityWindows
```

Required methods:

```matlab
validate()
canLinkTo(otherTerminal, timeVector)
estimateLatency(rangeKm)
estimateCapacity()
```

Initial MVP may only store values. Design it so scheduler outputs can use terminal IDs later.

---

# 5. Orekit Wrapper Layer

Keep all raw Orekit Java calls isolated in `/src/orekit`.

## 5.1 OrekitInitializer

Responsibilities:

- Add required JARs to MATLAB Java path.
- Verify Orekit is on the Java classpath.
- Verify Java version.
- Load orekit-data.
- Initialize time scales.
- Initialize frames.
- Initialize Earth model.
- Provide useful diagnostics.

Required functions/methods:

```matlab
initialize()
isInitialized()
validateJava()
validateOrekitClasses()
loadOrekitData(dataPath)
getVersion()
printDiagnostics()
```

## 5.2 OrekitTime

Responsibilities:

- Convert MATLAB `datetime` to Orekit `AbsoluteDate`.
- Convert Orekit `AbsoluteDate` to MATLAB `datetime`.
- Handle UTC/TAI time scale choices.

Required methods:

```matlab
toAbsoluteDate(dt, timeScale)
fromAbsoluteDate(absDate, timeScale)
durationSeconds(startTime, stopTime)
makeDateArray(timeVector)
```

## 5.3 OrekitFrames

Responsibilities:

- Provide inertial frame.
- Provide Earth-fixed frame.
- Provide topocentric frame support.

Required methods:

```matlab
getEME2000()
getGCRF()
getITRF()
getBodyFrame(centralBody)
makeTopocentricFrame(latDeg, lonDeg, altMeters, name)
```

## 5.4 OrekitOrbitFactory

Responsibilities:

- Build Orekit orbits from MATLAB data.

Required methods:

```matlab
fromKeplerian(elements, epoch, frame, mu)
fromCartesian(positionM, velocityMps, epoch, frame, mu)
fromTLE(line1, line2)
```

## 5.5 OrekitPropagatorFactory

Responsibilities:

- Build propagators.

Supported MVP propagators:

```text
Keplerian
TLE/SGP4 if feasible
Numerical placeholder
```

Required methods:

```matlab
createKeplerianPropagator(orbit)
createTLEPropagator(tle)
createNumericalPropagator(initialState, settings)
```

## 5.6 OrekitAccessEngine

Responsibilities:

- Compute access/visibility.
- Compute azimuth/elevation/range.
- Compute access windows.

Required methods:

```matlab
computeSatToGroundAccess(scenario, satName, gsName, options)
computeGroundToSatAccess(scenario, gsName, satName, options)
computeSatToSatAccess(scenario, sat1Name, sat2Name, options)
computeAzElRange(scenario, observerName, targetName, options)
extractWindows(timeVector, accessLogical)
```

---

# 6. Access Result Schema

Create an `AccessResult` struct or class.

Required fields:

```matlab
SourceName
TargetName
SourceType
TargetType
ScenarioEpoch
ScenarioStartTime
ScenarioStopTime
TimeVector
AccessLogical
AccessWindows
AzimuthDeg
ElevationDeg
RangeKm
DurationSeconds
MaxElevationDeg
MinRangeKm
AccessType
Metadata
```

`AccessWindows` must be a MATLAB table with columns:

```text
Source
Target
StartTime
StopTime
DurationSeconds
MaxElevationDeg
MinRangeKm
AccessType
```

Additional optional columns for future scheduling:

```text
LinkType
SourceTerminal
TargetTerminal
CapacityBps
LatencySeconds
SlewTimeSeconds
Priority
ConstraintStatus
```

---

# 7. Contact Plan Schema

Create a scheduler-ready contact plan table.

Required columns:

```text
ContactID
Source
Target
SourceType
TargetType
StartTime
StopTime
DurationSeconds
RangeKmMean
RangeKmMin
RangeKmMax
LatencySecondsMean
LinkType
AccessType
Priority
CapacityBps
SourceTerminal
TargetTerminal
SlewTimeSeconds
Notes
```

Supported link types:

```text
Sat-Ground
Ground-Sat
Sat-Sat
Sensor-Target
Terminal-Terminal
```

Initial MVP may fill unused columns with missing values.

---

# 8. Visualization Requirements

Create UI-independent plotting functions.

## Required plotting functions

```matlab
plotOrbit3D(scenario, objectName, options)
plotGroundTrack(scenario, objectName, options)
plotGroundStations(scenario, options)
plotAccessTimeline(accessResult, options)
plotElevationProfile(accessResult, options)
plotAzElRange(accessResult, options)
plotContactGantt(contactPlan, options)
plotConstellation3D(scenario, options)
plotScenario2D(scenario, options)
```

Rules:

- Plot functions may create figures.
- Plot functions must not require App Designer.
- UI can pass a UIAxes handle through options if needed.
- If no axes are provided, create a normal MATLAB figure.
- Plotting functions should return handles.

Example:

```matlab
opts = struct();
opts.ParentAxes = app.UIAxes;
plotGroundTrack(app.Scenario, "Sat-1", opts);
```

---

# 9. Animation Requirements

Create a backend animation system.

## 9.1 AnimationController

Required properties:

```matlab
CurrentTime
StartTime
StopTime
Step
IsPlaying
PlaybackRate
Loop
CurrentIndex
TimeVector
```

Required methods:

```matlab
setTime(time)
stepForward()
stepBackward()
reset()
play()
pause()
stop()
isAtEnd()
isAtStart()
```

## 9.2 animateScenario

Create:

```matlab
handles = animateScenario(scenario, options)
```

Required features:

- Start at scenario epoch.
- Stop at scenario stop time.
- Step by animation step.
- Draw Earth.
- Draw satellites.
- Draw ground tracks.
- Draw ground stations.
- Optionally draw active access links.
- Return handles.
- Support script mode.
- Support UI axes through options.
- Support pause/play/step/reset from `AnimationController`.

---

# 10. UI Requirements

Only build the UI after the backend MVP works.

## Required UI tabs

```text
Scenario
Satellites
Ground Stations
Propagation
Access
Animation
Reports/Export
Settings/Diagnostics
```

## Scenario tab

Controls:

- Scenario name.
- Epoch.
- Duration.
- Stop time.
- Time step.
- Central body.
- Earth model.
- Save scenario.
- Load scenario.

## Satellites tab

Controls:

- Add satellite.
- Edit satellite.
- Delete satellite.
- Orbit input mode:
  - Keplerian.
  - Cartesian.
  - TLE placeholder.
- Propagator type.
- Satellite object table.

## Ground Stations tab

Controls:

- Add ground station.
- Edit ground station.
- Delete ground station.
- Latitude.
- Longitude.
- Altitude.
- Minimum elevation.
- Ground station object table.

## Propagation tab

Controls:

- Run propagation.
- Clear ephemeris.
- Show propagation status.
- Plot orbit.
- Plot ground track.
- Export ephemeris.

## Access tab

Controls:

- Source object dropdown.
- Target object dropdown.
- Compute access.
- Access window table.
- Plot access timeline.
- Plot elevation profile.
- Export access report.
- Export contact plan.

## Animation tab

Controls:

- Play.
- Pause.
- Reset.
- Step forward.
- Step backward.
- Current time.
- Playback speed.
- Animation axes.
- Toggle ground tracks.
- Toggle access links.

## Reports/Export tab

Controls:

- Export scenario.
- Export ephemeris.
- Export access windows.
- Export contact plan.
- Export Markdown report.
- Export HTML report.

## Settings/Diagnostics tab

Controls:

- Orekit status.
- Java classpath status.
- Orekit-data path.
- Reload Orekit.
- Print diagnostics.
- Run self-test.

---

# 11. Standalone Script Inventory

Create a large set of standalone scripts so every backend feature can be tested without the UI.

All scripts should live under:

```text
/examples/headless
/examples/validation
/examples/reports
/examples/ui
```

Each script should be runnable independently after `startupOrekitSuite.m`.

---

## 11.1 Setup and Environment Scripts

### `script_000_startupOrekitSuite.m`

Purpose:

- Add all `/src` folders to MATLAB path.
- Add Orekit JARs to Java path.
- Load orekit-data.
- Print startup diagnostics.

Expected output:

- Orekit initialized.
- Java version.
- Orekit version if available.
- Orekit-data path.
- MATLAB path status.

---

### `script_001_checkJavaEnvironment.m`

Purpose:

- Check MATLAB Java version.
- Check static/dynamic Java classpath.
- Confirm required JARs are loaded.
- Detect missing dependencies.

Expected output:

- Java version table.
- Classpath status.
- Missing dependency warnings.

---

### `script_002_checkOrekitEnvironment.m`

Purpose:

- Verify core Orekit classes are reachable.
- Verify time scales can be created.
- Verify EME2000/ITRF frames can be created.
- Verify Earth model can be initialized.

Expected output:

- Pass/fail checks for Orekit setup.

---

### `script_003_printOrekitDiagnostics.m`

Purpose:

- Print complete diagnostics for troubleshooting.

Expected output:

- MATLAB version.
- Java version.
- Orekit class status.
- Orekit-data status.
- Frame/time-scale status.

---

### `script_004_resetOrekitEnvironment.m`

Purpose:

- Clear cached Orekit state if possible.
- Re-run initializer.
- Useful during development.

---

## 11.2 Scenario Configuration Scripts

### `script_010_createBasicScenarioConfig.m`

Purpose:

- Create a basic scenario config with epoch, duration, and time step.
- Validate config.
- Print scenario summary.

---

### `script_011_createScenarioWithStopTime.m`

Purpose:

- Define scenario using explicit stop time instead of duration.
- Verify duration is computed correctly.

---

### `script_012_createScenarioWithDuration.m`

Purpose:

- Define scenario using duration.
- Verify stop time is computed correctly.

---

### `script_013_generateScenarioTimeVector.m`

Purpose:

- Generate scenario time vector.
- Print number of steps.
- Verify first/last time.

---

### `script_014_validateBadScenarioInputs.m`

Purpose:

- Test invalid scenario inputs:
  - Negative time step.
  - Stop before epoch.
  - Empty name.
  - Invalid duration.
- Confirm useful errors are thrown.

---

### `script_015_saveAndLoadScenarioConfig.m`

Purpose:

- Save scenario config to MAT/JSON.
- Load it back.
- Verify equivalence.

---

## 11.3 Object Creation Scripts

### `script_020_createMissionScenario.m`

Purpose:

- Create a `MissionScenario` from `ScenarioConfig`.
- Print scenario object.

---

### `script_021_addSingleSatelliteKeplerian.m`

Purpose:

- Create satellite using Keplerian elements.
- Add it to scenario.
- Validate object registry.

---

### `script_022_addSingleSatelliteCartesian.m`

Purpose:

- Create satellite using Cartesian state.
- Add it to scenario.

---

### `script_023_addSingleSatelliteTLE.m`

Purpose:

- Create satellite from TLE.
- Add it to scenario.
- Use as placeholder if TLE propagation is not ready.

---

### `script_024_addSingleGroundStation.m`

Purpose:

- Create one ground station.
- Add it to scenario.
- Validate latitude/longitude/altitude.

---

### `script_025_addMultipleGroundStations.m`

Purpose:

- Add several ground stations:
  - Denver.
  - Hawaii.
  - Alaska.
  - Guam.
  - Madrid.
  - Canberra.
- Print object list.

---

### `script_026_addMultipleSatellites.m`

Purpose:

- Add multiple satellites with different RAAN/true anomaly values.
- Prepare for constellation examples.

---

### `script_027_addSensorPlaceholder.m`

Purpose:

- Add a sensor object to a satellite.
- Confirm it is stored but not yet fully analyzed.

---

### `script_028_addTerminalPlaceholder.m`

Purpose:

- Add communication terminal objects to a satellite.
- Prepare for future scheduler/contact-plan work.

---

### `script_029_objectRegistryOperations.m`

Purpose:

- Add, remove, rename, and list objects.
- Verify duplicate names are rejected.

---

## 11.4 Propagation Scripts

### `script_030_propagateSingleSatelliteKeplerian.m`

Purpose:

- Propagate one Keplerian satellite over the scenario duration.
- Store ephemeris in the satellite object.

Expected outputs:

- Time vector.
- ECI position.
- ECI velocity.
- Optional ECEF/LLA.

---

### `script_031_propagateSingleSatelliteCartesian.m`

Purpose:

- Propagate one Cartesian-state satellite.

---

### `script_032_propagateTLESatellite.m`

Purpose:

- Propagate one TLE satellite if TLE support is available.
- Otherwise print a clear not-yet-supported message.

---

### `script_033_propagateMultipleSatellites.m`

Purpose:

- Propagate multiple satellites in a scenario.

---

### `script_034_comparePropagationStepSizes.m`

Purpose:

- Propagate the same satellite with 10 sec, 30 sec, and 60 sec time steps.
- Compare ephemeris size and runtime.

---

### `script_035_clearAndRepropagate.m`

Purpose:

- Clear ephemeris.
- Change time step.
- Repropagate.

---

### `script_036_exportEphemerisCSV.m`

Purpose:

- Propagate satellite.
- Export ephemeris to CSV.

---

### `script_037_exportEphemerisMAT.m`

Purpose:

- Propagate satellite.
- Export ephemeris to MAT.

---

### `script_038_getStateAtSpecificTime.m`

Purpose:

- Propagate satellite.
- Query satellite state at a specific scenario time.

---

### `script_039_interpolateEphemeris.m`

Purpose:

- Query state at a time not exactly on the time grid.
- Test interpolation behavior.

---

## 11.5 Coordinate Conversion Scripts

### `script_040_convertECItoECEF.m`

Purpose:

- Convert propagated ECI states to ECEF.

---

### `script_041_convertECEFtoLLA.m`

Purpose:

- Convert ECEF positions to latitude/longitude/altitude.

---

### `script_042_generateGroundTrackTable.m`

Purpose:

- Produce table with:
  - Time.
  - Latitude.
  - Longitude.
  - Altitude.

---

### `script_043_plotLLAOverTime.m`

Purpose:

- Plot latitude, longitude, and altitude versus time.

---

### `script_044_testLongitudeWrapping.m`

Purpose:

- Verify ground-track longitude wrapping at ±180 degrees.

---

### `script_045_compareFrames.m`

Purpose:

- Compare output in ECI, ECEF, and LLA.

---

## 11.6 Ground Station Geometry Scripts

### `script_050_computeAzElRangeSingleStation.m`

Purpose:

- Compute azimuth/elevation/range from one ground station to one satellite.

---

### `script_051_plotElevationProfile.m`

Purpose:

- Plot elevation angle versus time.

---

### `script_052_plotAzimuthProfile.m`

Purpose:

- Plot azimuth versus time.

---

### `script_053_plotRangeProfile.m`

Purpose:

- Plot range versus time.

---

### `script_054_testMinimumElevationConstraint.m`

Purpose:

- Change ground-station minimum elevation.
- Show how access windows change.

---

### `script_055_groundStationAvailabilityWindows.m`

Purpose:

- Add ground station availability windows.
- Compute access only when the station is available.

---

### `script_056_groundStationMaskPlaceholder.m`

Purpose:

- Demonstrate azimuth/elevation mask placeholder.

---

## 11.7 Access Calculation Scripts

### `script_060_computeSatToGroundAccess.m`

Purpose:

- Compute access from satellite to ground station.
- Generate access windows.

---

### `script_061_computeGroundToSatAccess.m`

Purpose:

- Compute access from ground station to satellite.
- Should produce equivalent result to sat-to-ground when constraints are symmetric.

---

### `script_062_computeAccessBetweenTwoNamedObjects.m`

Purpose:

- Use generic `computeAccess(scenario, sourceName, targetName)`.

---

### `script_063_computeNoAccessCase.m`

Purpose:

- Create a geometry where no access occurs.
- Confirm empty windows are handled cleanly.

---

### `script_064_computeMultipleStationAccess.m`

Purpose:

- One satellite to multiple ground stations.
- Output table of all access windows.

---

### `script_065_computeMultipleSatelliteAccessToOneStation.m`

Purpose:

- Multiple satellites to one ground station.

---

### `script_066_computeAllPairAccess.m`

Purpose:

- Compute access for all valid object pairs.

---

### `script_067_extractAccessWindowsFromLogical.m`

Purpose:

- Unit-level script for converting logical access vector into start/stop windows.

---

### `script_068_accessWindowMetrics.m`

Purpose:

- Compute duration, max elevation, min range for each window.

---

### `script_069_accessReportSummary.m`

Purpose:

- Summarize total access time, number of passes, longest pass, highest elevation.

---

## 11.8 Satellite-to-Satellite Scripts

### `script_070_computeSatToSatLineOfSight.m`

Purpose:

- Compute satellite-to-satellite line-of-sight if supported.
- Use Earth occultation constraint.

---

### `script_071_computeSatToSatRange.m`

Purpose:

- Compute range between two satellites over time.

---

### `script_072_computeSatToSatContactWindows.m`

Purpose:

- Convert sat-to-sat visibility into contact windows.

---

### `script_073_satToSatWithMaxRangeConstraint.m`

Purpose:

- Apply max range constraint.

---

### `script_074_satToSatContactPlan.m`

Purpose:

- Export sat-to-sat contact plan.

---

## 11.9 Sensor and Slew Placeholder Scripts

### `script_080_createSatelliteWithSensor.m`

Purpose:

- Create satellite with sensor definition.

---

### `script_081_sensorFieldOfViewPlaceholder.m`

Purpose:

- Store and display field-of-view settings.

---

### `script_082_computeLookAnglePlaceholder.m`

Purpose:

- Compute simple look angle placeholder if feasible.

---

### `script_083_sensorAccessToGroundTargetPlaceholder.m`

Purpose:

- Prepare architecture for future sensor-to-target access.

---

### `script_084_slewRateConstraintPlaceholder.m`

Purpose:

- Add slew-rate setting and demonstrate where slew time would be computed.

---

### `script_085_slewTimeBetweenTargetsPlaceholder.m`

Purpose:

- Compute approximate slew time between two pointing directions when enough geometry exists.

---

## 11.10 Communications / Terminal Scripts

### `script_090_createSatelliteWithTerminals.m`

Purpose:

- Add communication terminals to satellites.

---

### `script_091_terminalCapacityPlaceholder.m`

Purpose:

- Store data rate/capacity settings.

---

### `script_092_terminalLatencyEstimate.m`

Purpose:

- Estimate latency from range.

---

### `script_093_terminalContactPlanFields.m`

Purpose:

- Show contact plan with terminal fields.

---

### `script_094_terminalSchedulingInputStub.m`

Purpose:

- Export scheduler-ready table with:
  - Source.
  - Target.
  - Time window.
  - Capacity.
  - Latency.
  - Terminal IDs.
  - Slew placeholder.

---

## 11.11 Contact Plan Export Scripts

### `script_100_buildBasicContactPlan.m`

Purpose:

- Convert access results to contact plan.

---

### `script_101_exportContactPlanCSV.m`

Purpose:

- Export contact plan to CSV.

---

### `script_102_exportContactPlanMAT.m`

Purpose:

- Export contact plan to MAT.

---

### `script_103_exportContactPlanJSON.m`

Purpose:

- Export contact plan to JSON if supported.

---

### `script_104_mergeContactPlans.m`

Purpose:

- Merge multiple access results into one contact plan.

---

### `script_105_filterContactPlanByDuration.m`

Purpose:

- Remove contacts shorter than threshold.

---

### `script_106_filterContactPlanByObject.m`

Purpose:

- Filter contact plan by source or target.

---

### `script_107_addPriorityToContactPlan.m`

Purpose:

- Add priority values for scheduler use.

---

### `script_108_contactPlanForMILPStub.m`

Purpose:

- Export fields needed for future MILP scheduling:
  - Window start index.
  - Window stop index.
  - Duration.
  - Capacity.
  - Latency.
  - Slew time.
  - Terminal IDs.
  - Conflict groups.

---

### `script_109_contactPlanForGreedySchedulerStub.m`

Purpose:

- Export simplified contact plan for greedy scheduler.

---

## 11.12 Visualization Scripts

### `script_110_plotSingleOrbit3D.m`

Purpose:

- Plot 3D orbit for one satellite.

---

### `script_111_plotMultipleOrbits3D.m`

Purpose:

- Plot 3D orbits for multiple satellites.

---

### `script_112_plotGroundTrack.m`

Purpose:

- Plot one satellite ground track.

---

### `script_113_plotMultipleGroundTracks.m`

Purpose:

- Plot multiple ground tracks.

---

### `script_114_plotGroundStations.m`

Purpose:

- Plot ground station locations.

---

### `script_115_plotScenario2DMap.m`

Purpose:

- Plot ground tracks and ground stations on a 2D map.

---

### `script_116_plotAccessTimeline.m`

Purpose:

- Plot access true/false over time.

---

### `script_117_plotContactGantt.m`

Purpose:

- Plot access windows as a Gantt chart.

---

### `script_118_plotAzElRange.m`

Purpose:

- Plot azimuth, elevation, and range.

---

### `script_119_plotPassSummary.m`

Purpose:

- Plot pass duration and max elevation by pass.

---

## 11.13 Animation Scripts

### `script_120_animateSingleSatellite.m`

Purpose:

- Animate one satellite around Earth.

---

### `script_121_animateGroundTrack.m`

Purpose:

- Animate satellite ground track point over time.

---

### `script_122_animateSatelliteAndGroundStation.m`

Purpose:

- Animate satellite and ground station together.

---

### `script_123_animateAccessLinks.m`

Purpose:

- Draw link only when access is active.

---

### `script_124_animationStepForwardBackward.m`

Purpose:

- Test animation controller stepping.

---

### `script_125_animationPausePlayReset.m`

Purpose:

- Test play, pause, and reset behavior.

---

### `script_126_animationWithMultipleSatellites.m`

Purpose:

- Animate multiple satellites.

---

### `script_127_exportAnimationFrames.m`

Purpose:

- Save animation frames as images or video if supported.

---

## 11.14 Scenario Save/Load Scripts

### `script_130_saveScenarioMAT.m`

Purpose:

- Save complete scenario to MAT.

---

### `script_131_loadScenarioMAT.m`

Purpose:

- Load scenario from MAT and validate.

---

### `script_132_saveScenarioJSON.m`

Purpose:

- Save scenario config/object catalog to JSON.

---

### `script_133_loadScenarioJSON.m`

Purpose:

- Load scenario from JSON.

---

### `script_134_saveScenarioWithResults.m`

Purpose:

- Save scenario including propagation and access results.

---

### `script_135_loadScenarioAndContinue.m`

Purpose:

- Load scenario, add another object, and rerun access.

---

## 11.15 Reporting Scripts

### `script_140_generateAccessMarkdownReport.m`

Purpose:

- Generate Markdown report containing:
  - Scenario summary.
  - Object list.
  - Access windows.
  - Pass metrics.

---

### `script_141_generateAccessHTMLReport.m`

Purpose:

- Generate HTML report if feasible.

---

### `script_142_generateScenarioSummaryReport.m`

Purpose:

- Generate scenario-level summary.

---

### `script_143_generateObjectCatalogReport.m`

Purpose:

- Export object catalog report.

---

### `script_144_generateContactPlanReport.m`

Purpose:

- Summarize contact plan for scheduling.

---

## 11.16 Batch and Automation Scripts

### `script_150_batchRunManyScenarios.m`

Purpose:

- Run multiple scenario configs in a loop.

---

### `script_151_batchVaryTimeStep.m`

Purpose:

- Compare results across time steps.

---

### `script_152_batchVaryGroundStationElevation.m`

Purpose:

- Compare access as min elevation changes.

---

### `script_153_batchVaryOrbitInclination.m`

Purpose:

- Compare access as inclination changes.

---

### `script_154_batchConstellationSweep.m`

Purpose:

- Sweep number of satellites and phasing.

---

### `script_155_batchExportAllReports.m`

Purpose:

- Run scenario, access, plots, contact plan, and reports automatically.

---

## 11.17 Validation Scripts

### `script_160_validateAccessWindowExtraction.m`

Purpose:

- Test access window extraction on hand-made logical vectors.

---

### `script_161_validateDurationMath.m`

Purpose:

- Validate duration calculations.

---

### `script_162_validateCoordinateRanges.m`

Purpose:

- Confirm:
  - Latitude is between -90 and 90.
  - Longitude is wrapped.
  - Altitude is reasonable.

---

### `script_163_validateGroundStationInputs.m`

Purpose:

- Test bad lat/lon/alt/min elevation values.

---

### `script_164_validateSatelliteInputs.m`

Purpose:

- Test bad orbital elements.

---

### `script_165_validateExportFiles.m`

Purpose:

- Confirm export files exist and have expected columns.

---

### `script_166_validateNoUISmokeTest.m`

Purpose:

- Run a complete scenario without UI:
  - Setup.
  - Scenario.
  - Satellite.
  - Ground station.
  - Propagation.
  - Access.
  - Export.

---

## 11.18 UI Bridge Scripts

### `script_170_launchUI.m`

Purpose:

- Launch App Designer UI.

---

### `script_171_loadScenarioIntoUI.m`

Purpose:

- Load a saved backend scenario into the UI.

---

### `script_172_exportScenarioFromUIEquivalent.m`

Purpose:

- Demonstrate that UI-produced scenario matches headless scenario.

---

### `script_173_testUIAdaptersWithoutApp.m`

Purpose:

- Test UI adapter functions without launching the actual UI.

---

## 11.19 Debugging Scripts

### `script_180_debugOrekitClasspath.m`

Purpose:

- Print and inspect Java classpath.

---

### `script_181_debugOrekitDataLoading.m`

Purpose:

- Diagnose orekit-data problems.

---

### `script_182_debugPropagationFailure.m`

Purpose:

- Minimal reproducible propagation test.

---

### `script_183_debugAccessFailure.m`

Purpose:

- Minimal reproducible access test.

---

### `script_184_debugTimeConversion.m`

Purpose:

- Verify MATLAB datetime to Orekit AbsoluteDate conversion.

---

### `script_185_debugFrameConversion.m`

Purpose:

- Verify ECI/ECEF/LLA conversion.

---

### `script_186_debugObjectSerialization.m`

Purpose:

- Verify object save/load behavior.

---

## 11.20 End-to-End Demo Scripts

### `script_190_demoOneSatOneGroundStation.m`

Purpose:

- Complete MVP demo:
  - Setup.
  - Scenario.
  - Satellite.
  - Ground station.
  - Propagation.
  - Access.
  - Plots.
  - Contact plan export.

---

### `script_191_demoSmallConstellation.m`

Purpose:

- Multiple satellites and one ground station.

---

### `script_192_demoGroundStationNetwork.m`

Purpose:

- One satellite and multiple ground stations.

---

### `script_193_demoSatToSatContacts.m`

Purpose:

- Satellite-to-satellite access demo if available.

---

### `script_194_demoSchedulerInputGeneration.m`

Purpose:

- Generate contact plan suitable for later MILP/greedy scheduler.

---

### `script_195_demoAnimation.m`

Purpose:

- Full scenario animation.

---

### `script_196_demoSaveLoadRerun.m`

Purpose:

- Save scenario.
- Load scenario.
- Rerun propagation/access.

---

### `script_197_demoReportGeneration.m`

Purpose:

- Generate reports and exports.

---

### `script_198_demoHeadlessRegression.m`

Purpose:

- Run all critical headless examples.

---

### `script_199_demoFullWorkflow.m`

Purpose:

- Complete workflow from scenario creation to exports and animation.

---

# 12. Example Headless MVP Script

Create this as:

```text
/examples/headless/script_190_demoOneSatOneGroundStation.m
```

Expected code style:

```matlab
clear; clc;

startupOrekitSuite;

cfg = ScenarioConfig();
cfg.Name = "One Sat One Ground Station Demo";
cfg.Epoch = datetime(2026,1,1,0,0,0,"TimeZone","UTC");
cfg.Duration = hours(24);
cfg.TimeStep = seconds(30);
cfg.AnimationStep = seconds(60);
cfg.CentralBody = "Earth";
cfg.DefaultPropagatorType = "Keplerian";
cfg.validate();

scenario = MissionScenario(cfg);

sat = SatelliteObject.fromKeplerian( ...
    "Sat-1", ...
    7000e3, ...
    0.001, ...
    51.6, ...
    0.0, ...
    0.0, ...
    0.0);

gs = GroundStationObject( ...
    "Denver-GS", ...
    39.7392, ...
    -104.9903, ...
    1609.0, ...
    10.0);

scenario = scenario.addObject(sat);
scenario = scenario.addObject(gs);

scenario = scenario.propagate();

accessResult = computeAccess(scenario, "Sat-1", "Denver-GS");

disp(accessResult.AccessWindows);

plotGroundTrack(scenario, "Sat-1");
plotElevationProfile(accessResult);
plotAccessTimeline(accessResult);

contactPlan = buildContactPlan(accessResult);
exportContactPlan(contactPlan, fullfile("data","exports","demo_contact_plan.csv"));

animateScenario(scenario);
```

---

# 13. Backend API Requirements

The backend should expose a clean API.

## Required user-facing backend calls

```matlab
startupOrekitSuite
cfg = ScenarioConfig()
scenario = MissionScenario(cfg)
scenario = scenario.addObject(obj)
scenario = scenario.removeObject(name)
obj = scenario.getObject(name)
names = scenario.listObjects()
scenario = scenario.propagate()
result = computeAccess(scenario, sourceName, targetName)
result = computeAzElRange(scenario, observerName, targetName)
contactPlan = buildContactPlan(accessResult)
plotGroundTrack(scenario, objectName)
plotOrbit3D(scenario, objectName)
plotAccessTimeline(accessResult)
plotElevationProfile(accessResult)
animateScenario(scenario)
saveScenario(scenario, filename)
scenario = loadScenario(filename)
exportEphemeris(scenario, objectName, filename)
exportAccessReport(accessResult, filename)
exportContactPlan(contactPlan, filename)
```

---

# 14. Testing Requirements

Create MATLAB tests for:

```text
ScenarioConfig
ScenarioClock
MissionScenario
MissionObject
SatelliteObject
GroundStationObject
OrekitInitializer
OrekitTime
OrekitFrames
OrekitOrbitFactory
OrekitPropagatorFactory
Propagation
Coordinate conversion
Az/el/range
Access window extraction
Contact plan generation
Exports
AnimationController
Headless examples
```

Also create:

```matlab
runAllTests.m
```

It should run the full test suite and print a clear summary.

---

# 15. README Requirements

The README must explain:

- What the project does.
- Why it uses Orekit.
- MATLAB version requirement.
- Java version requirement.
- Orekit JAR requirement.
- Orekit-data requirement.
- Folder structure.
- Setup instructions.
- How to run the MVP demo.
- How to run tests.
- How to launch UI.
- How to add satellites.
- How to add ground stations.
- How to compute access.
- How to export contact plans.
- Current limitations.
- Future roadmap.
- Troubleshooting.

---

# 16. Development Sequence

The AI agent must work in this order:

## Phase 1 — Backend Skeleton

Implement:

- `ScenarioConfig`
- `ScenarioClock`
- `MissionScenario`
- `MissionObject`
- `SatelliteObject`
- `GroundStationObject`
- object registry behavior

## Phase 2 — Orekit Setup

Implement:

- `startupOrekitSuite`
- `OrekitInitializer`
- Java classpath validation
- Orekit-data loading
- time scales
- frames
- Earth model

## Phase 3 — Propagation MVP

Implement:

- one Keplerian satellite
- scenario epoch/duration/timestep
- ephemeris generation
- ECI output
- ECEF/LLA output if feasible

## Phase 4 — Access MVP

Implement:

- one satellite
- one ground station
- minimum elevation access
- az/el/range arrays
- access logical vector
- access window table

## Phase 5 — Visualization MVP

Implement:

- ground track plot
- 3D orbit plot
- elevation profile
- access timeline
- contact Gantt chart

## Phase 6 — Animation MVP

Implement:

- `AnimationController`
- script-based animation
- play/pause/step/reset
- active access link drawing

## Phase 7 — Export MVP

Implement:

- scenario save/load
- ephemeris export
- access report export
- contact plan export

## Phase 8 — UI MVP

Implement App Designer UI:

- scenario setup
- satellite creation
- ground station creation
- propagation button
- access calculation button
- animation controls
- export buttons

The UI must call the backend only.

## Phase 9 — Advanced Expansion

Add:

- multiple satellites
- multiple stations
- sat-to-sat access
- sensor constraints
- slew constraints
- terminal constraints
- capacity/latency modeling
- scheduler-ready exports
- MILP/greedy scheduler integration

---

# 17. Critical Agent Instructions

When implementing:

1. Do not hallucinate Orekit APIs.
2. Check the installed Orekit version.
3. Write small verification snippets for uncertain Java calls.
4. Keep raw Java calls isolated in `/src/orekit`.
5. Do not put backend logic inside the UI.
6. Make every major feature scriptable.
7. Write tests as features are added.
8. Keep the MVP small and working before expanding.
9. Use clear MATLAB class and function names.
10. Use MATLAB tables for analysis results.
11. Use `datetime` and `duration` consistently.
12. Use helpful error messages.
13. Avoid giant scripts.
14. Avoid giant App Designer callbacks.
15. Return useful data from every function.
16. Keep examples runnable.
17. Keep exports scheduler-friendly.
18. Document limitations honestly.

---

# 18. Deliverables

Produce:

1. Architecture summary.
2. Folder/file structure.
3. Backend class skeletons.
4. Orekit setup scripts.
5. Headless MVP demo.
6. Propagation MVP.
7. Access MVP.
8. Visualization MVP.
9. Animation MVP.
10. Export MVP.
11. App Designer UI plan.
12. Tests.
13. README.
14. Standalone script inventory.
15. Roadmap for advanced STK-like features.

---

# 19. Definition of Done for MVP

The MVP is done when this works from a clean MATLAB session:

```matlab
startupOrekitSuite
script_190_demoOneSatOneGroundStation
```

And the script successfully:

- Initializes Orekit.
- Creates a scenario.
- Sets epoch/duration/time step.
- Adds one satellite.
- Adds one ground station.
- Propagates satellite.
- Computes access.
- Prints access windows.
- Plots ground track.
- Plots elevation profile.
- Exports contact plan.
- Runs without opening the UI.

The UI can come after this.

-------
# Feature Request: Add STK-Like Sensors to Satellites and Ground/Place Objects

Add a full sensor/payload feature to the MATLAB + Orekit mission scenario suite. The goal is to support sensors attached to satellites, ground stations, facilities, places, and targets, with behavior similar to common STK sensor workflows.

The feature must be backend-first. The UI must only call backend functions. Do not put sensor geometry, access logic, field-of-view logic, pointing logic, or slew logic inside App Designer callbacks.

---

## 1. Core Design Rule

Sensors must work in both modes:

### Headless / No-UI Mode

A user should be able to create and attach sensors from a script:

```matlab
sat = scenario.getObject("Sat-1");

sensor = SensorObject.conical( ...
    "SatCam-1", ...
    "Sat-1", ...
    20.0);  % half-angle deg

sensor.PointingMode = "Nadir";
sensor.MinRangeKm = 0;
sensor.MaxRangeKm = 2500;

sat = sat.addSensor(sensor);
scenario = scenario.updateObject(sat);

target = PlaceObject( ...
    "Denver Target", ...
    39.7392, ...
    -104.9903, ...
    1609.0);

scenario = scenario.addObject(target);

result = computeSensorAccess(scenario, "Sat-1", "SatCam-1", "Denver Target");

plotSensorAccessTimeline(result);
exportAccessReport(result, "sensor_access.csv");
```

### UI Mode

The UI should only collect inputs and call backend functions:

```matlab
sensor = app.readSensorFromUI();
scenario = addSensorToObject(scenario, parentObjectName, sensor);

result = computeSensorAccess( ...
    scenario, ...
    parentObjectName, ...
    sensorName, ...
    targetName);
```

No UI callback should directly compute sensor vectors, cone intersections, look angles, or access windows.

---

## 2. Supported Parent Objects

Sensors should be attachable to:

* Satellites
* Ground stations
* Facilities
* Places
* Vehicles placeholder
* Aircraft placeholder
* Ships placeholder
* Area targets placeholder

For the first implementation, fully support:

* Satellite-mounted sensors
* Ground-station/facility-mounted sensors
* Access from satellite sensor to place/ground target
* Access from satellite sensor to ground station
* Access from ground sensor to satellite

Leave clean placeholders for more object types.

---

## 3. New Object Types

Add these object classes if they do not already exist:

```text
SensorObject
PlaceObject
TargetObject
AreaTargetObject
FacilityObject
```

### PlaceObject

A `PlaceObject` represents a fixed point on Earth.

Required properties:

```matlab
Name
ObjectType = "Place"
LatitudeDeg
LongitudeDeg
AltitudeMeters
Description
Color
Metadata
```

Required methods:

```matlab
validate()
getPosition(time, frameName)
getECEF(time)
getLLA(time)
plotLocation()
toStruct()
fromStruct()
```

### TargetObject

A `TargetObject` may be an alias or extension of `PlaceObject`.

Use it for sensor access workflows.

Required properties:

```matlab
Name
ObjectType = "Target"
LatitudeDeg
LongitudeDeg
AltitudeMeters
TargetType
Priority
Metadata
```

### AreaTargetObject

An `AreaTargetObject` represents a polygon/region on Earth.

Initial MVP may only store the polygon.

Required properties:

```matlab
Name
ObjectType = "AreaTarget"
LatitudeDeg
LongitudeDeg
BoundaryLatDeg
BoundaryLonDeg
AltitudeMeters
Metadata
```

Required methods:

```matlab
validate()
containsPoint(latDeg, lonDeg)
getCentroid()
plotBoundary()
```

---

## 4. SensorObject Requirements

Create or expand the `SensorObject` class.

Required properties:

```matlab
Name
ObjectType = "Sensor"
ParentName
ParentType
SensorType
PointingMode
MountingFrame
BoresightVector
UpVector
FieldOfViewType
ConeHalfAngleDeg
InnerHalfAngleDeg
OuterHalfAngleDeg
RectangularHalfAngleXDeg
RectangularHalfAngleYDeg
CustomFovBoundary
MinRangeKm
MaxRangeKm
MinElevationDeg
MaxLookAngleDeg
MinLookAngleDeg
SlewRateDegPerSec
SlewAccelerationDegPerSec2
CurrentPointingTarget
AvailabilityWindows
Constraints
Metadata
```

Required methods:

```matlab
validate()
attachTo(parentObject)
detach()
getParentName()
getBoresightVector(time, scenario)
getFieldOfViewGeometry(time, scenario)
computeLookVector(scenario, targetName, timeVector)
computeLookAngles(scenario, targetName, timeVector)
canSeeTarget(scenario, targetName, timeVector, options)
toStruct()
fromStruct()
copy()
```

---

## 5. Supported Sensor Types

Support STK-like sensor types.

### MVP Sensor Types

Implement these first:

```text
SimpleConic
Rectangular
FixedVector
NadirPointing
Targeted
```

### Future Sensor Types

Create placeholders for:

```text
ComplexConic
HalfPower
CustomPattern
EOIR
Radar
Communications
Scanning
Pushbroom
SAR
Gimbaled
```

---

## 6. Field-of-View Types

Support these field-of-view definitions:

### Simple Conic

A circular cone defined by one half-angle.

Properties:

```matlab
ConeHalfAngleDeg
```

Access condition:

```text
angle between sensor boresight and target look vector <= ConeHalfAngleDeg
```

### Rectangular

A rectangular FOV defined by horizontal and vertical half-angles.

Properties:

```matlab
RectangularHalfAngleXDeg
RectangularHalfAngleYDeg
```

Access condition:

```text
target look vector must fall inside horizontal and vertical angular bounds
```

### Annular / Complex Conic Placeholder

Properties:

```matlab
InnerHalfAngleDeg
OuterHalfAngleDeg
```

Access condition:

```text
InnerHalfAngleDeg <= offBoresightAngle <= OuterHalfAngleDeg
```

This can be placeholder-only at first.

### Custom Boundary Placeholder

Properties:

```matlab
CustomFovBoundary
```

Used later for arbitrary sensor patterns.

---

## 7. Pointing Modes

Support STK-like pointing behavior.

### MVP Pointing Modes

```text
Nadir
FixedVector
Targeted
VelocityVector
BodyFixed
```

### Future Pointing Modes

```text
Gimbaled
Scanning
SunPointing
GroundTrack
AlongTrack
CrossTrack
CustomAttitude
```

### Nadir Pointing

For satellite-mounted sensors:

* Boresight points from satellite toward Earth center or local nadir.
* Used for Earth observation.

### Fixed Vector

The boresight is fixed in the parent body frame.

Example:

```matlab
sensor.BoresightVector = [0; 0; -1];
```

### Targeted

The sensor points directly at a named target.

Example:

```matlab
sensor.PointingMode = "Targeted";
sensor.CurrentPointingTarget = "Denver Target";
```

This should make access easier because off-boresight angle may be zero, but other constraints such as range, Earth obstruction, and availability still apply.

### Velocity Vector Placeholder

Sensor points along satellite velocity direction.

### Body Fixed Placeholder

Sensor points using parent attitude/body frame.

---

## 8. Sensor Constraints

Create a flexible constraint system.

Each sensor may have constraints such as:

```text
FieldOfView
MinRange
MaxRange
MinElevation
LineOfSight
EarthObstruction
Lighting
SunExclusionAngle
MoonExclusionAngle
SlewRate
Availability
TargetPriority
```

MVP constraints:

* Field of view
* Line of sight
* Earth obstruction
* Min range
* Max range
* Min elevation, where applicable
* Availability windows

Future placeholders:

* Lighting
* Eclipse
* Sun exclusion
* Moon exclusion
* Slew rate
* Slew acceleration
* Sensor duty cycle
* Data storage
* Power constraints

---

## 9. Sensor Access Calculation

Create a backend function:

```matlab
sensorAccessResult = computeSensorAccess( ...
    scenario, ...
    parentObjectName, ...
    sensorName, ...
    targetObjectName, ...
    options)
```

It must support:

```text
Satellite sensor -> Place/Target
Satellite sensor -> GroundStation
Satellite sensor -> AreaTarget placeholder
Ground sensor -> Satellite
Ground sensor -> Target placeholder
```

Required output fields:

```matlab
SourceName
SensorName
TargetName
ParentName
ParentType
TargetType
ScenarioEpoch
TimeVector
AccessLogical
AccessWindows
RangeKm
AzimuthDeg
ElevationDeg
OffBoresightAngleDeg
LookAngleDeg
IncidenceAngleDeg
ConstraintStatus
AccessType
Metadata
```

`AccessWindows` must be a MATLAB table with:

```text
Parent
Sensor
Target
StartTime
StopTime
DurationSeconds
MaxElevationDeg
MinRangeKm
MaxOffBoresightDeg
AccessType
```

Additional optional fields:

```text
LightingStatus
SunAngleDeg
MoonAngleDeg
SlewTimeSeconds
TargetPriority
SensorMode
```

---

## 10. Access Logic

For each time step:

1. Get parent object position.
2. Get target object position.
3. Compute line-of-sight vector from parent to target.
4. Check Earth obstruction if needed.
5. Compute range.
6. Compute sensor boresight vector.
7. Compute off-boresight angle.
8. Check whether target is inside field of view.
9. Check min/max range.
10. Check min elevation if observer is ground-based or if applicable.
11. Check availability windows.
12. Combine constraints into `AccessLogical`.
13. Extract access windows.
14. Compute window metrics.

The access calculation should produce both:

* A simple final access logical vector.
* A detailed constraint-status table.

Example constraint status table columns:

```text
Time
LineOfSightOK
EarthObstructionOK
FieldOfViewOK
RangeOK
ElevationOK
AvailabilityOK
SlewOK
FinalAccess
```

---

## 11. Area Target Support

Add placeholder support for area targets similar to STK area targets.

Initial implementation:

* Store polygon boundary.
* Compute centroid.
* Compute access to centroid.
* Report clearly that full polygon coverage is not yet implemented.

Future implementation:

* Sample grid points inside polygon.
* Compute percent coverage.
* Compute access when at least one point is visible.
* Compute access when full area is visible.
* Compute revisit time.
* Compute coverage statistics.

Required future functions:

```matlab
sampleAreaTarget(areaTarget, spacingKm)
computeAreaCoverage(scenario, sensorName, areaTargetName)
plotAreaCoverage()
exportCoverageReport()
```

---

## 12. Slew Support

Add placeholders now and design for real slew later.

Required properties:

```matlab
SlewRateDegPerSec
SlewAccelerationDegPerSec2
CurrentPointingTarget
PreviousPointingTarget
```

Required functions:

```matlab
computeSlewAngle(pointingVectorA, pointingVectorB)
computeSlewTime(slewAngleDeg, slewRateDegPerSec, slewAccelerationDegPerSec2)
computeTargetToTargetSlew(scenario, sensorName, targetA, targetB, time)
```

MVP:

* Compute approximate slew time from angular separation / slew rate.
* Do not enforce slew constraints unless options.EnableSlewConstraints is true.

Future:

* Include acceleration.
* Include settling time.
* Include target sequencing.
* Integrate with scheduler.

---

## 13. UI Requirements for Sensors

Add a new UI tab:

```text
Sensors / Payloads
```

The UI must support:

* Select parent object.
* Add sensor.
* Edit sensor.
* Delete sensor.
* Select sensor type.
* Select pointing mode.
* Enter cone half-angle.
* Enter rectangular FOV angles.
* Enter boresight vector.
* Enter min/max range.
* Enter min elevation.
* Enter slew rate.
* Select target for targeted mode.
* Show sensors attached to selected object.

Add sensor access controls either in the Access tab or a new Sensor Access tab:

* Select parent object.
* Select sensor.
* Select target object.
* Compute sensor access.
* Show access windows.
* Plot off-boresight angle.
* Plot range.
* Plot access timeline.
* Export sensor access report.

UI callbacks must call backend functions only.

Bad:

```matlab
function ComputeSensorAccessButtonPushed(app, event)
    % geometry and FOV math here
end
```

Good:

```matlab
function ComputeSensorAccessButtonPushed(app, event)
    result = computeSensorAccess( ...
        app.Scenario, ...
        app.ParentDropDown.Value, ...
        app.SensorDropDown.Value, ...
        app.TargetDropDown.Value, ...
        app.readSensorAccessOptionsFromUI());

    app.displaySensorAccessResult(result);
end
```

---

## 14. Visualization Requirements

Add plotting functions:

```matlab
plotSensorFOV(scenario, parentObjectName, sensorName, time, options)
plotSensorAccessTimeline(sensorAccessResult, options)
plotOffBoresightAngle(sensorAccessResult, options)
plotSensorRange(sensorAccessResult, options)
plotSensorGroundFootprint(scenario, parentObjectName, sensorName, time, options)
plotAreaTarget(areaTarget, options)
plotSensorCoverageMap(coverageResult, options)
```

MVP visualization:

* Plot access timeline.
* Plot off-boresight angle over time.
* Plot sensor ground footprint as approximate circle for simple conic nadir sensor.
* Plot target location.
* Plot when target is inside/outside FOV.

---

## 15. Export Requirements

Add exports:

```matlab
exportSensorAccessReport(sensorAccessResult, filename)
exportSensorAccessWindows(sensorAccessResult, filename)
exportSensorConstraintStatus(sensorAccessResult, filename)
exportSensorDefinitions(scenario, filename)
exportCoverageReport(coverageResult, filename)
```

Sensor access report should include:

* Scenario name.
* Parent object.
* Sensor name.
* Target name.
* Sensor type.
* Pointing mode.
* FOV settings.
* Constraint settings.
* Access windows.
* Total access duration.
* Number of passes.
* Maximum elevation.
* Minimum range.
* Maximum off-boresight angle during access.

---

## 16. Standalone Sensor Scripts

Add these scripts under:

```text
/examples/headless/sensors
```

### `script_200_createSatelliteSensorSimpleConic.m`

Purpose:

* Create satellite.
* Add simple conic nadir-pointing sensor.
* Print sensor definition.

### `script_201_createSatelliteSensorRectangular.m`

Purpose:

* Create rectangular FOV sensor.
* Attach to satellite.

### `script_202_createGroundSensor.m`

Purpose:

* Create ground station/facility sensor.
* Point it upward or toward a satellite.

### `script_203_createPlaceTarget.m`

Purpose:

* Create fixed place/target object.

### `script_204_computeSatSensorToPlaceAccess.m`

Purpose:

* Compute access from satellite sensor to place target.

### `script_205_computeSatSensorToGroundStationAccess.m`

Purpose:

* Compute access from satellite sensor to ground station.

### `script_206_computeGroundSensorToSatelliteAccess.m`

Purpose:

* Compute access from ground sensor to satellite.

### `script_207_compareConicHalfAngles.m`

Purpose:

* Compare access for cone half-angles:

  * 5 deg
  * 10 deg
  * 20 deg
  * 30 deg

### `script_208_comparePointingModes.m`

Purpose:

* Compare:

  * Nadir pointing
  * Targeted pointing
  * Fixed vector pointing

### `script_209_sensorConstraintStatusTable.m`

Purpose:

* Show detailed constraint status table.

### `script_210_plotSensorAccessTimeline.m`

Purpose:

* Plot sensor access timeline.

### `script_211_plotOffBoresightAngle.m`

Purpose:

* Plot off-boresight angle versus time.

### `script_212_plotSensorGroundFootprint.m`

Purpose:

* Plot approximate sensor footprint.

### `script_213_exportSensorAccessReport.m`

Purpose:

* Export sensor access report.

### `script_214_sensorSlewPlaceholder.m`

Purpose:

* Demonstrate slew angle and slew time placeholder.

### `script_215_areaTargetCentroidAccess.m`

Purpose:

* Create area target.
* Compute access to centroid.

### `script_216_areaTargetCoveragePlaceholder.m`

Purpose:

* Demonstrate placeholder coverage workflow.

### `script_217_sensorAccessBatchTargets.m`

Purpose:

* One sensor computes access to multiple targets.

### `script_218_sensorAccessBatchSatellites.m`

Purpose:

* Multiple satellites with sensors compute access to one target.

### `script_219_sensorFullDemo.m`

Purpose:

* Complete demo:

  * Scenario.
  * Satellite.
  * Nadir conic sensor.
  * Place target.
  * Propagation.
  * Sensor access.
  * Access windows.
  * Off-boresight plot.
  * Access timeline.
  * Export report.

---

## 17. Testing Requirements

Add tests:

```text
testSensorObject
testPlaceObject
testTargetObject
testAreaTargetObject
testSensorAttachment
testSensorFOVSimpleConic
testSensorFOVRectangular
testSensorPointingNadir
testSensorPointingTargeted
testSensorAccessSatToPlace
testSensorAccessGroundToSat
testSensorConstraintStatus
testSensorAccessWindowExtraction
testSensorExports
testSensorHeadlessExamples
```

Specific tests:

1. Sensor can attach to satellite.
2. Sensor can attach to ground station.
3. Duplicate sensor names are rejected on same parent.
4. Simple conic FOV accepts target inside cone.
5. Simple conic FOV rejects target outside cone.
6. Rectangular FOV checks horizontal/vertical bounds.
7. Nadir pointing produces valid boresight vectors.
8. Targeted pointing points toward selected target.
9. Sensor access returns required fields.
10. Sensor access windows table has required columns.
11. Sensor constraint status table has required columns.
12. Export files are created with expected columns.
13. Sensor examples run without UI.

---

## 18. Contact Plan Integration

Sensor access should optionally export into the same contact-plan format.

Add fields:

```text
SensorName
SensorType
PointingMode
OffBoresightAngleDeg
SlewTimeSeconds
CoverageType
TargetPriority
```

For scheduler-ready exports, include:

```text
TaskID
SensorName
ParentObject
TargetObject
WindowStart
WindowStop
DurationSeconds
SlewTimeSeconds
Priority
RequiredDataVolumeBits
EstimatedDataVolumeBits
```

This will support future task scheduling and MILP optimization.

---

## 19. Development Order

Implement this feature in this order:

### Phase S1 — Data Model

* `SensorObject`
* `PlaceObject`
* `TargetObject`
* `AreaTargetObject`
* attach/detach sensors to parent objects
* scenario object registry updates

### Phase S2 — Basic Geometry

* parent-to-target vectors
* range
* off-boresight angle
* simple conic FOV check
* line-of-sight check

### Phase S3 — Sensor Access MVP

* `computeSensorAccess`
* access logical vector
* constraint status table
* access windows table

### Phase S4 — Pointing Modes

* nadir pointing
* fixed vector pointing
* targeted pointing

### Phase S5 — Visualization

* sensor access timeline
* off-boresight plot
* approximate sensor footprint

### Phase S6 — Exports

* sensor access CSV
* sensor access MAT
* sensor definition export
* report generation

### Phase S7 — UI

* Sensors/Payloads tab
* Add/edit/delete sensor
* Sensor access calculation UI
* Sensor plots
* Sensor exports

### Phase S8 — Advanced Placeholders

* rectangular FOV
* area target centroid access
* slew time
* lighting constraints
* coverage analysis placeholders

---

## 20. Definition of Done

This feature is complete when this headless workflow works:

```matlab
startupOrekitSuite;

cfg = ScenarioConfig();
cfg.Name = "Sensor Demo";
cfg.Epoch = datetime(2026,1,1,0,0,0,"TimeZone","UTC");
cfg.Duration = hours(24);
cfg.TimeStep = seconds(30);

scenario = MissionScenario(cfg);

sat = SatelliteObject.fromKeplerian( ...
    "Sat-1", ...
    7000e3, ...
    0.001, ...
    51.6, ...
    0, ...
    0, ...
    0);

sensor = SensorObject.simpleConic( ...
    "NadirCam", ...
    "Sat-1", ...
    20.0);

sensor.PointingMode = "Nadir";
sensor.MaxRangeKm = 2500;

sat = sat.addSensor(sensor);

target = PlaceObject( ...
    "Denver Target", ...
    39.7392, ...
    -104.9903, ...
    1609.0);

scenario = scenario.addObject(sat);
scenario = scenario.addObject(target);

scenario = scenario.propagate();

result = computeSensorAccess( ...
    scenario, ...
    "Sat-1", ...
    "NadirCam", ...
    "Denver Target");

disp(result.AccessWindows);

plotSensorAccessTimeline(result);
plotOffBoresightAngle(result);

exportSensorAccessReport(result, "sensor_access_report.csv");
```

The workflow must run without launching the UI.

Only after this works should the UI sensor tab be implemented.
