# Sensor Tasking, Area Scanning, Multi-Sensor Coordination, and Scheduling Extension

## Core Intent

Extend the MATLAB + Orekit mission scenario suite so sensors are not just passive objects attached to satellites. Sensors must be able to accept tasks, evaluate whether those tasks are geometrically feasible, generate candidate access/scan windows, and feed those candidate windows into a scheduler.

This is not just an access calculator. This is a tasking and scheduling framework.

The software should support these use cases:

1. One sensor on one satellite tracks one point target.
2. One sensor on one satellite tracks one moving target.
3. One sensor scans an area target.
4. One sensor repeatedly revisits an area target.
5. Two sensors on two different satellites observe the same target.
6. Two sensors on two different satellites scan the same area target.
7. Multiple sensors from multiple satellites cooperate to cover an area target.
8. Multiple task requests compete for limited sensor time.
9. Sensor slew, dwell time, revisit time, field of view, field of regard, and scheduling conflicts are considered.
10. Outputs are suitable for greedy scheduling, MILP scheduling, or future optimization.

The major architecture rule still applies:

The UI must not contain sensor tasking or scheduling logic.
The UI only creates task inputs, calls backend tasking/scheduling functions, and displays the results.

---

## Important Conceptual Separation

Separate the problem into three layers:

### 1. Geometry Layer

This layer answers:

* When can this sensor see this target?
* What are the look angles?
* What is the range?
* Is the target inside the sensor field of regard?
* Is the target inside the sensor field of view?
* Is lighting acceptable?
* Is Earth occultation blocking the view?
* Is minimum elevation or off-nadir angle satisfied?

This produces feasible observation opportunities.

### 2. Task Opportunity Layer

This layer converts geometric access into candidate task windows.

It answers:

* Can this task fit inside this access window?
* What dwell time is available?
* How long would the sensor need to slew into position?
* Is the scan long enough to cover the requested target?
* How much of the area can be covered?
* What quality score should the candidate receive?
* What data volume would be produced?
* What priority should the candidate have?

This produces scheduler candidates.

### 3. Scheduling Layer

This layer chooses which candidate tasks actually get assigned.

It answers:

* Which task should each sensor perform at each time?
* Are two tasks conflicting?
* Can a sensor only do one thing at once?
* Can one target require two sensors simultaneously?
* Can an area target be split across multiple sensors?
* Should the scheduler maximize priority, coverage, revisit performance, or total value?
* Should the scheduler use greedy logic first and MILP later?

This produces the final sensor schedule.

---

# Required New Object Types

Add or extend these backend classes.

## SensorObject

The existing `SensorObject` should be expanded.

Required properties:

```matlab
Name
ParentObjectName
SensorType
BoresightFrame
BoresightVector
FieldOfViewShape
FieldOfViewDeg
FieldOfRegardDeg
MinOffNadirDeg
MaxOffNadirDeg
MaxSlewRateDegPerSec
MaxSlewAccelDegPerSec
SettlingTimeSeconds
MinDwellTimeSeconds
MaxDwellTimeSeconds
ScanRateDegPerSec
SwathWidthKm
ResolutionModel
DataRateBps
PowerWatts
AvailabilityWindows
CurrentPointingState
TaskQueue
Metadata
```

Supported `SensorType` values:

```text
OpticalNadir
OpticalAgile
RadarSAR
WideAreaScanner
NarrowFOVTracker
CommunicationsPayload
GenericSensor
```

Supported `FieldOfViewShape` values:

```text
Cone
Rectangular
Strip
Custom
```

Required methods:

```matlab
validate()
addTask(task)
removeTask(taskID)
clearTasks()
listTasks()
canObserveTarget(scenario, targetName, timeVector, options)
computeLookAngles(scenario, targetName, timeVector, options)
computeSlewTime(fromPointing, toPointing)
computeObservationWindows(scenario, task, options)
computeScanOpportunities(scenario, task, options)
estimateDataVolume(task, durationSeconds)
estimateObservationQuality(task, geometry)
toStruct()
fromStruct()
```

Important:

* A sensor belongs to a parent satellite or platform.
* A sensor may have many possible tasks but can only execute one task at a time unless explicitly modeled otherwise.
* A sensor should have pointing and slew constraints.
* Sensor tasking must be callable from scripts without UI.

---

## TargetObject

Create a `TargetObject` class for point targets.

Required properties:

```matlab
Name
TargetType
LatitudeDeg
LongitudeDeg
AltitudeMeters
Trajectory
Priority
RequiredDwellTimeSeconds
Metadata
```

Supported target types:

```text
FixedPoint
MovingPoint
GroundVehicle
Aircraft
Ship
SpaceObject
GenericPointTarget
```

Required methods:

```matlab
getPosition(time, frameName)
getLLA(time)
isMoving()
validate()
toStruct()
fromStruct()
```

MVP:

* Support fixed point ground targets first.
* Leave moving targets as an extensible placeholder.

---

## AreaTargetObject

Create an `AreaTargetObject` class.

Required properties:

```matlab
Name
AreaType
BoundaryLatLon
GridPoints
GridResolutionKm
Priority
RequiredCoveragePercent
RequiredRevisitTimeSeconds
RequiredDwellPerGridPointSeconds
Metadata
```

Supported area types:

```text
Polygon
Circle
Rectangle
Grid
CountryRegion
Custom
```

Required methods:

```matlab
generateGrid()
getBoundary()
getGridPoints()
getAreaKm2()
plotArea()
validate()
toStruct()
fromStruct()
```

MVP:

* Support polygon boundary defined by latitude/longitude vertices.
* Generate grid points inside the polygon.
* Treat area scanning as observing a set of point targets/grid cells.

---

# Required New Task Types

Create a `SensorTask` class or struct.

Required properties:

```matlab
TaskID
TaskName
TaskType
TargetName
AssignedSensorName
AssignedPlatformName
Priority
EarliestStartTime
LatestStopTime
RequiredStartTime
RequiredStopTime
MinDurationSeconds
MaxDurationSeconds
RequiredDwellTimeSeconds
RequiredCoveragePercent
RequiredRevisitTimeSeconds
RequiresSimultaneousSensors
RequiredSensorCount
AllowedSensorNames
AllowedPlatformNames
ForbiddenSensorNames
TaskStatus
Metadata
```

Supported `TaskType` values:

```text
TrackPointTarget
TrackMovingTarget
ScanAreaTarget
RevisitAreaTarget
StereoObservePointTarget
MultiSensorTrackPointTarget
MultiSensorScanAreaTarget
DwellOnTarget
SearchArea
ImageStrip
CollectOverPass
```

Supported `TaskStatus` values:

```text
Unscheduled
CandidateGenerated
Scheduled
PartiallyScheduled
Rejected
Completed
Failed
```

Task behavior:

* A point-target tracking task requires continuous dwell on one target for a required duration.
* A moving-target task requires the sensor to track a target whose position changes over time.
* An area-scan task requires covering some percentage of an area target.
* A revisit-area task requires repeated collections over the same area with a maximum revisit gap.
* A multi-sensor task may require two or more sensors either simultaneously or within a time tolerance.
* A stereo observation task requires two sensors viewing the same target with a useful geometry separation.

---

# New Backend Functions

Implement these backend functions in `/src/analysis` or `/src/scheduling`.

## Geometry / Opportunity Generation

```matlab
opportunities = computeSensorAccess(scenario, sensorName, targetName, options)
```

Purpose:

* Compute raw geometric feasibility between one sensor and one target.
* Works for point targets and area targets.
* Returns time-series look angles, range, access logicals, and feasible windows.

---

```matlab
opportunities = computeSensorTaskOpportunities(scenario, task, options)
```

Purpose:

* Convert a task request into one or more candidate opportunities.
* For each allowed sensor, check if it can perform the task.
* Return candidate windows that can be passed to a scheduler.

---

```matlab
opportunities = computePointTargetTrackOpportunities(scenario, task, options)
```

Purpose:

* Generate candidate windows for one sensor tracking one point target.

Required candidate fields:

```text
CandidateID
TaskID
SensorName
PlatformName
TargetName
StartTime
StopTime
DurationSeconds
SlewTimeSeconds
DwellTimeSeconds
MeanRangeKm
MinRangeKm
MaxElevationDeg
MeanOffNadirDeg
MaxOffNadirDeg
QualityScore
Priority
Feasible
RejectReason
```

---

```matlab
opportunities = computeAreaScanOpportunities(scenario, task, options)
```

Purpose:

* Generate candidate scan opportunities for one sensor scanning an area target.

Required candidate fields:

```text
CandidateID
TaskID
SensorName
PlatformName
AreaTargetName
StartTime
StopTime
DurationSeconds
SlewTimeSeconds
CoveredGridPointCount
TotalGridPointCount
CoveragePercent
EstimatedSwathKm
EstimatedDataVolumeMb
QualityScore
Priority
Feasible
RejectReason
```

MVP approach:

* Convert the area target to grid points.
* Determine which grid points are inside the sensor footprint over time.
* Estimate coverage percentage.
* Later improve with true footprint polygon intersection.

---

```matlab
opportunities = computeMultiSensorTaskOpportunities(scenario, task, options)
```

Purpose:

* Generate candidates for tasks requiring multiple sensors.

Examples:

* Two sensors track one point target at the same time.
* Two sensors scan the same area target.
* Multiple sensors divide an area into coverage segments.
* Stereo observation of one point target.

Required candidate fields:

```text
CandidateID
TaskID
SensorNames
PlatformNames
TargetName
StartTime
StopTime
DurationSeconds
SensorCount
Simultaneous
TimeSeparationSeconds
GeometryDiversityScore
CoveragePercent
CombinedQualityScore
Priority
Feasible
RejectReason
```

---

## Scheduling Functions

Create a new `/src/scheduling` folder.

Recommended files:

```text
/src/scheduling
  SensorTask.m
  TaskRequest.m
  TaskCandidate.m
  SensorSchedule.m
  SchedulerOptions.m
  generateTaskCandidates.m
  scheduleSensorTasksGreedy.m
  scheduleSensorTasksMILP.m
  detectTaskConflicts.m
  buildSensorTimeline.m
  scoreTaskCandidate.m
  exportSensorSchedule.m
  exportMILPInputs.m
  validateSchedule.m
```

---

```matlab
candidates = generateTaskCandidates(scenario, taskList, options)
```

Purpose:

* Take a list of sensor tasks.
* Generate all feasible task candidates for all allowed sensors.
* Return a scheduler-ready table.

Candidate table columns:

```text
CandidateID
TaskID
TaskName
TaskType
SensorName
PlatformName
TargetName
StartTime
StopTime
DurationSeconds
SlewTimeSeconds
DwellTimeSeconds
CoveragePercent
QualityScore
Priority
DataVolumeMb
PowerUsedWh
Feasible
RejectReason
ConflictGroup
RequiresSimultaneousSensors
RequiredSensorCount
```

---

```matlab
schedule = scheduleSensorTasksGreedy(scenario, candidates, options)
```

Purpose:

* Create a simple first-pass scheduler.
* Sort candidates by priority and quality.
* Assign tasks while avoiding conflicts.
* Enforce one active task per sensor at a time.
* Respect slew time between consecutive tasks.
* Respect task time windows.
* Respect required dwell duration.
* Respect area coverage requirements when possible.

Greedy scoring should consider:

```text
Task priority
Observation quality
Duration fit
Coverage percent
Slew penalty
Data volume penalty
Revisit urgency
Target importance
Sensor availability
```

---

```matlab
schedule = scheduleSensorTasksMILP(scenario, candidates, options)
```

Purpose:

* Create a placeholder or initial MILP-ready formulation.
* Do not force full MILP implementation in the first pass, but design the candidate table so MILP can use it.

MILP decision variable:

```text
x_c = 1 if candidate c is selected, 0 otherwise
```

Potential objective:

```text
maximize sum(priority_c * quality_c * x_c)
       - slewPenalty
       - dataPenalty
       - missedTaskPenalty
```

Potential constraints:

1. A sensor can perform at most one task at a time.
2. A task requiring one collection can be selected at most once.
3. A task requiring multiple sensors must select the required number of compatible candidates.
4. Simultaneous tasks must overlap within allowed tolerance.
5. Area tasks must meet minimum coverage percent if scheduled.
6. Revisit tasks must satisfy maximum revisit interval.
7. Slew time must fit between consecutive scheduled tasks.
8. Data volume must not exceed storage/downlink assumptions if modeled.
9. Power use must not exceed power budget if modeled.
10. Sensor availability windows must be respected.

The agent should initially export MILP input tables even if the solver is not implemented yet.

---

```matlab
conflicts = detectTaskConflicts(candidates, options)
```

Purpose:

* Detect overlapping tasks for the same sensor.
* Detect insufficient slew time between tasks.
* Detect target exclusivity conflicts if applicable.
* Detect simultaneous multi-sensor task incompatibilities.

Conflict table columns:

```text
ConflictID
CandidateID_1
CandidateID_2
ConflictType
SensorName
OverlapSeconds
RequiredSlewSeconds
AvailableSlewSeconds
Explanation
```

Supported conflict types:

```text
SameSensorOverlap
InsufficientSlewTime
TargetExclusivity
PlatformResourceConflict
DataStorageConflict
PowerConflict
SimultaneousRequirementNotMet
```

---

```matlab
timeline = buildSensorTimeline(schedule, options)
```

Purpose:

* Convert scheduled tasks into per-sensor timelines.

Timeline columns:

```text
SensorName
PlatformName
TaskID
TaskName
TaskType
TargetName
StartTime
StopTime
DurationSeconds
SlewBeforeSeconds
SlewAfterSeconds
Status
```

---

```matlab
exportSensorSchedule(schedule, filename)
exportMILPInputs(candidates, conflicts, filenameBase)
```

Purpose:

* Export scheduled tasks and MILP-ready input data.

---

# Required Data Products

## Sensor Access Result

Create a `SensorAccessResult` class or struct.

Required fields:

```matlab
SensorName
ParentPlatformName
TargetName
TargetType
TaskType
TimeVector
AccessLogical
LookAngleDeg
OffNadirDeg
AzimuthDeg
ElevationDeg
RangeKm
InFieldOfRegard
InFieldOfView
LightingOK
SlewFeasible
AccessWindows
Metadata
```

---

## Task Candidate Table

All task opportunity generation should eventually become a candidate table.

Required columns:

```text
CandidateID
TaskID
TaskName
TaskType
SensorName
PlatformName
TargetName
TargetType
StartTime
StopTime
DurationSeconds
SlewTimeSeconds
DwellTimeSeconds
CoveragePercent
QualityScore
Priority
DataVolumeMb
PowerUsedWh
Feasible
RejectReason
ConflictGroup
```

Optional columns:

```text
GridPointIDs
CoveredGridPointCount
TotalGridPointCount
MeanRangeKm
MinRangeKm
MaxRangeKm
MeanOffNadirDeg
MaxOffNadirDeg
MeanElevationDeg
MaxElevationDeg
LightingScore
GeometryDiversityScore
StereoAngleDeg
RequiredSensorCount
SimultaneousGroupID
```

---

## Sensor Schedule Table

Final scheduled output should be a table.

Required columns:

```text
ScheduleID
TaskID
CandidateID
TaskName
TaskType
SensorName
PlatformName
TargetName
StartTime
StopTime
DurationSeconds
SlewBeforeSeconds
DwellTimeSeconds
CoveragePercent
QualityScore
Priority
Status
Notes
```

---

# Scheduling Examples That Must Work Headlessly

The AI agent should create standalone examples for sensor tasking and scheduling.

Add these scripts to the standalone inventory.

## `script_200_createPointTarget.m`

Purpose:

* Create one fixed point target on Earth.
* Add it to a scenario.

---

## `script_201_createAreaTargetPolygon.m`

Purpose:

* Create a polygon area target from latitude/longitude vertices.
* Generate grid points inside the area.

---

## `script_202_addSensorToSatellite.m`

Purpose:

* Add one agile optical sensor to one satellite.

---

## `script_203_singleSensorTrackPointTarget.m`

Purpose:

* One satellite sensor tracks one point target.
* Generate candidate task windows.

---

## `script_204_singleSensorScanAreaTarget.m`

Purpose:

* One satellite sensor scans one area target.
* Estimate coverage percentage.

---

## `script_205_twoSensorsTrackOneTarget.m`

Purpose:

* Two satellites, each with one sensor.
* Both sensors attempt to track the same point target.
* Generate individual and combined multi-sensor candidates.

---

## `script_206_twoSensorsScanOneArea.m`

Purpose:

* Two satellites scan the same area target.
* Estimate combined area coverage.

---

## `script_207_multiSatelliteAreaScan.m`

Purpose:

* Multiple satellites with sensors scan one area target.
* Generate coverage candidates.

---

## `script_208_createSensorTaskList.m`

Purpose:

* Create a list of mixed task requests:

  * Track point target.
  * Scan area target.
  * Revisit area target.
  * Multi-sensor observation.

---

## `script_209_generateSensorTaskCandidates.m`

Purpose:

* Convert task list into candidate observation windows.

---

## `script_210_detectSensorTaskConflicts.m`

Purpose:

* Generate candidates.
* Detect same-sensor overlaps and insufficient slew conflicts.

---

## `script_211_greedySensorScheduling.m`

Purpose:

* Run greedy scheduler on candidate table.
* Output scheduled task table.

---

## `script_212_exportSensorScheduleCSV.m`

Purpose:

* Export scheduled sensor tasks to CSV.

---

## `script_213_exportMILPInputsForSensorScheduling.m`

Purpose:

* Export candidate and conflict tables for future MILP scheduling.

---

## `script_214_plotSensorTimeline.m`

Purpose:

* Plot final scheduled tasks as a per-sensor timeline.

---

## `script_215_plotAreaCoverage.m`

Purpose:

* Plot area target, grid points, and covered grid points.

---

## `script_216_plotMultiSensorCoverage.m`

Purpose:

* Show combined area coverage from multiple sensors.

---

## `script_217_demoSensorTaskingFullWorkflow.m`

Purpose:

* Complete demo:

  * Create scenario.
  * Add satellites.
  * Add sensors.
  * Add point target.
  * Add area target.
  * Create task list.
  * Generate candidates.
  * Detect conflicts.
  * Run greedy scheduler.
  * Export schedule.
  * Plot timeline.
  * Plot area coverage.

---

# Example Backend Usage

The final backend should support script usage like this:

```matlab
startupOrekitSuite;

cfg = ScenarioConfig();
cfg.Name = "Sensor Tasking Demo";
cfg.Epoch = datetime(2026,1,1,0,0,0,"TimeZone","UTC");
cfg.Duration = hours(24);
cfg.TimeStep = seconds(30);

scenario = MissionScenario(cfg);

sat1 = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
sat2 = SatelliteObject.fromKeplerian("Sat-2", 7000e3, 0.001, 51.6, 45, 0, 180);

sensor1 = SensorObject("Sensor-1", "Sat-1");
sensor1.SensorType = "OpticalAgile";
sensor1.FieldOfViewDeg = 5;
sensor1.FieldOfRegardDeg = 45;
sensor1.MaxSlewRateDegPerSec = 2;
sensor1.MinDwellTimeSeconds = 10;

sensor2 = SensorObject("Sensor-2", "Sat-2");
sensor2.SensorType = "OpticalAgile";
sensor2.FieldOfViewDeg = 5;
sensor2.FieldOfRegardDeg = 45;
sensor2.MaxSlewRateDegPerSec = 2;
sensor2.MinDwellTimeSeconds = 10;

sat1 = sat1.addSensor(sensor1);
sat2 = sat2.addSensor(sensor2);

scenario = scenario.addObject(sat1);
scenario = scenario.addObject(sat2);

target = TargetObject("Target-A", 39.7392, -104.9903, 0);
scenario = scenario.addObject(target);

area = AreaTargetObject.fromPolygon( ...
    "Area-1", ...
    [39.5 -105.2;
     39.5 -104.7;
     40.0 -104.7;
     40.0 -105.2], ...
    5.0);

scenario = scenario.addObject(area);

scenario = scenario.propagate();

task1 = SensorTask();
task1.TaskID = "T001";
task1.TaskName = "Track Target-A";
task1.TaskType = "TrackPointTarget";
task1.TargetName = "Target-A";
task1.Priority = 10;
task1.RequiredDwellTimeSeconds = 30;
task1.AllowedSensorNames = ["Sensor-1","Sensor-2"];

task2 = SensorTask();
task2.TaskID = "T002";
task2.TaskName = "Scan Area-1";
task2.TaskType = "ScanAreaTarget";
task2.TargetName = "Area-1";
task2.Priority = 7;
task2.RequiredCoveragePercent = 80;
task2.MinDurationSeconds = 60;
task2.AllowedSensorNames = ["Sensor-1","Sensor-2"];

task3 = SensorTask();
task3.TaskID = "T003";
task3.TaskName = "Dual Sensor Track Target-A";
task3.TaskType = "MultiSensorTrackPointTarget";
task3.TargetName = "Target-A";
task3.Priority = 15;
task3.RequiresSimultaneousSensors = true;
task3.RequiredSensorCount = 2;
task3.RequiredDwellTimeSeconds = 20;

taskList = [task1, task2, task3];

opts = SchedulerOptions();
opts.SchedulerType = "Greedy";
opts.EnforceSlew = true;
opts.EnforceOneTaskPerSensor = true;
opts.AllowPartialAreaCoverage = true;

candidates = generateTaskCandidates(scenario, taskList, opts);

conflicts = detectTaskConflicts(candidates, opts);

schedule = scheduleSensorTasksGreedy(scenario, candidates, opts);

disp(schedule.Tasks);

plotSensorTimeline(schedule);
exportSensorSchedule(schedule, fullfile("data","exports","sensor_schedule.csv"));
exportMILPInputs(candidates, conflicts, fullfile("data","exports","sensor_milp"));
```

---

# Initial MVP for Sensor Tasking

Do not try to solve every advanced sensor problem first.

Implement in this order:

## Phase S1 — Data Model

* `SensorObject`
* `TargetObject`
* `AreaTargetObject`
* `SensorTask`
* `SchedulerOptions`

## Phase S2 — Single Sensor, Point Target

* Compute when a sensor can view a point target.
* Apply simple field-of-regard constraint.
* Apply required dwell time.
* Generate candidate task windows.

## Phase S3 — Single Sensor, Area Target

* Convert area polygon into grid points.
* Estimate which grid points are visible over time.
* Estimate coverage percentage.
* Generate scan candidates.

## Phase S4 — Multiple Sensors

* Generate candidates for two sensors viewing one target.
* Generate candidates for two sensors scanning one area.
* Support simultaneous and non-simultaneous task modes.

## Phase S5 — Conflict Detection

* Same sensor cannot do two tasks at the same time.
* Add slew time between consecutive pointings.
* Flag insufficient slew time.
* Flag overlapping task conflicts.

## Phase S6 — Greedy Scheduler

* Sort by priority and quality.
* Select feasible candidates.
* Avoid conflicts.
* Output schedule table.

## Phase S7 — MILP-Ready Export

* Export candidates.
* Export conflicts.
* Export task requirements.
* Export sensor availability.
* Do not require full MILP implementation yet.

## Phase S8 — UI Integration

Only after backend works:

* Add sensor task creation tab.
* Add target creation tab.
* Add area target creation tab.
* Add task candidate viewer.
* Add schedule viewer.
* Add timeline plot.
* Add area coverage plot.

Again: UI must only call backend functions.

---

# Required UI Additions

Add new UI tabs:

```text
Targets
Area Targets
Sensors
Sensor Tasks
Scheduling
Coverage
```

## Targets Tab

Controls:

* Add point target.
* Edit point target.
* Delete target.
* Latitude.
* Longitude.
* Altitude.
* Moving target placeholder.

## Area Targets Tab

Controls:

* Add polygon area.
* Import area vertices.
* Generate grid.
* Set grid resolution.
* Set required coverage percent.
* Plot area.

## Sensors Tab

Controls:

* Add sensor to satellite.
* Field of view.
* Field of regard.
* Slew rate.
* Dwell limits.
* Scan rate.
* Data rate.
* Sensor availability.

## Sensor Tasks Tab

Controls:

* Create task.
* Select task type.
* Select target or area target.
* Set priority.
* Set dwell time.
* Set coverage requirement.
* Set revisit requirement.
* Select allowed sensors.
* Select whether simultaneous sensors are required.

## Scheduling Tab

Controls:

* Generate task candidates.
* Show candidates table.
* Detect conflicts.
* Run greedy scheduler.
* Export MILP inputs.
* Show final schedule table.

## Coverage Tab

Controls:

* Plot area target.
* Plot covered grid points.
* Plot uncovered grid points.
* Plot coverage over time.
* Plot multi-sensor coverage.

---

# Scoring Model

Create a candidate scoring function:

```matlab
score = scoreTaskCandidate(candidate, task, options)
```

Initial scoring should combine:

```text
Task priority
Duration satisfaction
Dwell satisfaction
Coverage percent
Look angle quality
Range quality
Slew penalty
Data volume penalty
Revisit urgency
Multi-sensor geometry diversity
```

Suggested simple score:

```matlab
score = priorityWeight      * normalizedPriority ...
      + qualityWeight       * geometryQuality ...
      + coverageWeight      * coverageFraction ...
      + dwellWeight         * dwellSatisfaction ...
      - slewPenaltyWeight   * normalizedSlewTime ...
      - dataPenaltyWeight   * normalizedDataVolume;
```

The actual weights should live in `SchedulerOptions`.

---

# SchedulerOptions

Create a `SchedulerOptions` class.

Required properties:

```matlab
SchedulerType
EnforceOneTaskPerSensor
EnforceSlew
AllowPartialAreaCoverage
AllowTaskSplitting
AllowMultiSensorTasks
SimultaneousToleranceSeconds
MinimumCandidateDurationSeconds
MinimumCoveragePercent
PriorityWeight
QualityWeight
CoverageWeight
DwellWeight
SlewPenaltyWeight
DataPenaltyWeight
RevisitWeight
UseMILP
MILPSolverName
Verbose
```

Supported scheduler types:

```text
Greedy
MILP
Manual
None
```

---

# Important Implementation Notes

1. Do not confuse access with scheduling.

   * Access says a task could happen.
   * Scheduling decides whether it should happen.

2. Do not build sensor tasking inside the UI.

   * Build backend classes first.
   * Then make UI controls call backend functions.

3. Do not try to implement perfect sensor footprint geometry in the first pass.

   * Start with point-target visibility.
   * Then grid-based area approximation.
   * Then improve footprint modeling.

4. Do not hard-code a single sensor type.

   * Use generic sensor properties first.

5. Do not hard-code one satellite.

   * The scheduling system should support N sensors across N satellites.

6. Do not make every task require simultaneous sensors.

   * Some multi-sensor tasks are cooperative but not simultaneous.
   * Some require strict overlap.
   * Some only require coverage contribution.

7. Always preserve scheduler-ready tables.

   * Candidate tables and conflict tables are extremely important for future MILP.

8. Make all tasking examples runnable headlessly.

---

# Definition of Done for Sensor Tasking MVP

The sensor tasking MVP is complete when this works from a clean MATLAB session:

```matlab
startupOrekitSuite
script_217_demoSensorTaskingFullWorkflow
```

And the script successfully:

* Creates a scenario.
* Adds at least two satellites.
* Adds one sensor to each satellite.
* Adds one point target.
* Adds one polygon area target.
* Creates multiple sensor tasks.
* Generates candidate observation windows.
* Detects same-sensor task conflicts.
* Estimates slew time between tasks.
* Runs a greedy scheduler.
* Outputs a sensor schedule table.
* Exports the schedule to CSV.
* Exports MILP-ready candidate/conflict tables.
* Plots the scheduled sensor timeline.
* Plots area coverage.
* Runs without opening the UI.
# Sensor Field-of-Regard Visualization, Sensor Mount Viewer, and Satellite Inspection Mode

Extend the MATLAB + Orekit mission scenario suite so the user can visually inspect sensors mounted on satellites and turn sensor visualization layers on/off in both script mode and UI mode.

The goal is to make the sensor system easier to understand visually before using it for scheduling. A user should be able to select a satellite, view a simplified 3D satellite body, see where the sensors are mounted, see each sensor boresight direction, and optionally show the sensor field of view or field of regard shape.

The first implementation does not need a high-fidelity CAD satellite model. The satellite can initially be represented as a simple cube or rectangular box.

---

## Core Requirements

Add support for:

1. Turning sensor field-of-regard visualization on/off in the UI.
2. Turning sensor field-of-view visualization on/off in the UI.
3. Selecting a satellite and viewing where its sensors are mounted.
4. Displaying the satellite as a simple cube or rectangular prism.
5. Displaying each sensor as a small mounted object on the satellite body.
6. Displaying sensor boresight as an arrow.
7. Displaying sensor field of view as a narrow cone, pyramid, or frustum.
8. Displaying sensor field of regard as a wider transparent cone or sweep volume.
9. Displaying sensor labels.
10. Displaying body-frame axes.
11. Letting the user switch between:

    * Scenario view.
    * Satellite inspection view.
    * Sensor tasking view.
    * Area coverage view.

The UI must only call backend visualization functions. Do not put plotting or geometry logic directly inside App Designer callbacks.

---

# Important Conceptual Difference

The software should clearly distinguish:

## Sensor Field of View, FOV

The sensor FOV is the actual instantaneous view region of the sensor.

Example:

```text
A narrow optical camera cone.
```

## Sensor Field of Regard, FOR

The sensor FOR is the larger region the sensor can point within after slewing or gimbaling.

Example:

```text
The full cone of possible pointing directions reachable by the sensor mount.
```

The UI should allow the user to independently toggle:

```text
Show sensor body
Show sensor boresight
Show sensor FOV
Show sensor FOR
Show sensor labels
Show sensor mount points
Show satellite body frame
Show active task pointing
Show scheduled target lines
```

---

# Sensor Mounting Model

Extend `SensorObject` with mount information.

Add these properties:

```matlab
MountLocationBody
MountNormalBody
BoresightBody
SensorBodyFrame
MountFace
MountOffsetMeters
SensorSizeMeters
ShowInViewer
FOVVisible
FORVisible
BoresightVisible
LabelVisible
```

Where:

```matlab
MountLocationBody = [x y z];    % meters in satellite body frame
MountNormalBody   = [nx ny nz]; % normal direction from satellite body
BoresightBody     = [bx by bz]; % nominal sensor pointing direction
```

Supported `MountFace` values:

```text
+X
-X
+Y
-Y
+Z
-Z
Custom
```

Initial convention:

```text
Satellite body frame:
+X = forward face
-Y = left face
+Y = right face
+Z = nadir or top depending on user-selected convention
-Z = opposite face
```

The exact convention must be documented and configurable later.

---

# Satellite Visual Model

Add a simple visual model to `SatelliteObject`.

New properties:

```matlab
BodyModelType
BodyDimensionsMeters
BodyColor
ShowBodyFrame
ShowSensorMounts
VisualModel
```

Supported `BodyModelType` values:

```text
Cube
RectangularPrism
SimpleBus
CustomMeshPlaceholder
```

MVP:

```matlab
sat.BodyModelType = "Cube";
sat.BodyDimensionsMeters = [1 1 1];
```

For the first version, draw the satellite as a cube centered at the origin of the satellite body frame.

The visual model does not need to be physically accurate. It is mainly for inspecting sensor mounting and pointing geometry.

---

# New Backend Visualization Functions

Create these functions in `/src/visualization`.

```matlab
plotSatelliteBody(satellite, options)
```

Purpose:

* Draw satellite as a cube or rectangular prism.
* Draw body-frame axes.
* Return graphics handles.

---

```matlab
plotSensorMounts(satellite, options)
```

Purpose:

* Draw all sensors mounted on the selected satellite.
* Draw small sensor blocks or markers on the satellite cube.
* Draw sensor names if labels are enabled.

---

```matlab
plotSensorBoresight(sensor, options)
```

Purpose:

* Draw a boresight arrow from the sensor mount point.
* Use the sensor body-frame boresight direction.

---

```matlab
plotSensorFOV(sensor, options)
```

Purpose:

* Draw the instantaneous sensor field of view.
* Use a cone for circular FOV.
* Use a pyramid/frustum for rectangular FOV.
* Use the sensor boresight as the central axis.

---

```matlab
plotSensorFOR(sensor, options)
```

Purpose:

* Draw the larger field-of-regard volume.
* Use a wider cone or sweep volume.
* This should be independently toggleable from FOV.

---

```matlab
plotSatelliteSensorViewer(scenario, satelliteName, options)
```

Purpose:

* Main backend function for satellite inspection mode.
* Draw selected satellite body.
* Draw mounted sensors.
* Draw FOV/FOR depending on options.
* Draw sensor labels.
* Draw body axes.
* Return handles.

Example script use:

```matlab
opts = SensorViewerOptions();
opts.ShowSatelliteBody = true;
opts.ShowBodyFrame = true;
opts.ShowSensorMounts = true;
opts.ShowBoresight = true;
opts.ShowFOV = true;
opts.ShowFOR = false;
opts.ShowLabels = true;

plotSatelliteSensorViewer(scenario, "Sat-1", opts);
```

---

# Sensor Viewer Options

Create a `SensorViewerOptions` class or struct.

Required properties:

```matlab
ParentAxes
ShowSatelliteBody
ShowBodyFrame
ShowSensorMounts
ShowBoresight
ShowFOV
ShowFOR
ShowLabels
ShowActiveTaskPointing
ShowScheduledTargetLines
SelectedSensorName
FOVScale
FORScale
BoresightLength
SatelliteScale
UseTransparency
ViewMode
```

Supported `ViewMode` values:

```text
BodyFrame
ScenarioFrame
NadirPointing
CurrentAttitude
TaskPointing
```

MVP:

* Implement `BodyFrame` only.
* Later support attitude-based scenario-frame rendering.

---

# UI Requirements

Add a new UI tab:

```text
Satellite / Sensor Viewer
```

This tab should allow the user to:

1. Select a satellite from a dropdown.
2. Select a sensor from a dropdown or choose all sensors.
3. Display the satellite as a cube.
4. Show/hide sensor mount points.
5. Show/hide sensor names.
6. Show/hide sensor boresight arrows.
7. Show/hide sensor FOV.
8. Show/hide sensor FOR.
9. Show/hide body-frame axes.
10. Adjust FOV/FOR display scale.
11. Switch between body-frame view and scenario-frame view later.
12. Refresh the plot after sensor settings change.

Example UI controls:

```text
Satellite dropdown
Sensor dropdown
Show Satellite Body checkbox
Show Body Axes checkbox
Show Sensor Mounts checkbox
Show Sensor Labels checkbox
Show Boresight checkbox
Show FOV checkbox
Show FOR checkbox
FOV Scale spinner
FOR Scale spinner
Reset View button
Refresh Viewer button
```

UI callback rule:

```matlab
function RefreshSensorViewerButtonPushed(app, event)
    opts = app.readSensorViewerOptionsFromUI();
    plotSatelliteSensorViewer(app.Scenario, app.SelectedSatelliteDropDown.Value, opts);
end
```

Do not implement the actual plotting geometry inside the callback.

---

# Scenario Animation Integration

The normal scenario animation should also support optional sensor visualization layers.

Extend `animateScenario(scenario, options)` with:

```matlab
options.ShowSensorBoresight
options.ShowSensorFOV
options.ShowSensorFOR
options.ShowActiveTaskPointing
options.ShowScheduledTargetLines
options.SelectedSatelliteName
options.SelectedSensorName
```

In scenario animation mode:

* FOV/FOR should move with the satellite.
* If attitude is not implemented yet, use a documented placeholder body-frame orientation.
* If a sensor is assigned to a scheduled task, optionally draw a line from the satellite to the target during the task window.
* If a sensor is scanning an area target, optionally highlight covered grid points.

---

# Scheduling Integration

Sensor visualization should connect to tasking and scheduling.

For a selected scheduled task, the viewer should be able to display:

```text
Assigned sensor
Assigned target
Scheduled start time
Scheduled stop time
Nominal pointing direction
Slew from previous task
FOV at collection time
FOR limit
Target line of sight
Area grid points covered
```

Add backend function:

```matlab
plotScheduledSensorTask(scenario, schedule, taskID, options)
```

Purpose:

* Visualize the sensor and target geometry for one scheduled task.
* Show sensor boresight.
* Show target line.
* Show FOV/FOR.
* Show area coverage if the task is an area scan.

---

# Standalone Scripts to Add

Add these to the standalone script inventory.

## `script_220_createSatelliteCubeVisualModel.m`

Purpose:

* Create a satellite with a cube visual model.
* Plot the cube in body frame.

---

## `script_221_mountOneSensorOnSatelliteCube.m`

Purpose:

* Add one sensor to a satellite.
* Define mount face, mount location, and boresight.
* Plot satellite cube and sensor mount.

---

## `script_222_mountMultipleSensorsOnSatelliteCube.m`

Purpose:

* Add multiple sensors to different satellite faces.
* Plot all sensor mounts and labels.

---

## `script_223_plotSensorBoresight.m`

Purpose:

* Plot sensor boresight arrow from the sensor mount point.

---

## `script_224_toggleSensorFOV.m`

Purpose:

* Plot satellite sensor viewer with FOV on and FOR off.

---

## `script_225_toggleSensorFOR.m`

Purpose:

* Plot satellite sensor viewer with FOR on and FOV off.

---

## `script_226_compareSensorFOVandFOR.m`

Purpose:

* Plot both FOV and FOR together to show the difference.

---

## `script_227_satelliteSensorInspectionMode.m`

Purpose:

* Full satellite inspection demo:

  * Satellite cube.
  * Body axes.
  * Multiple mounted sensors.
  * Sensor labels.
  * Boresight arrows.
  * FOV cones.
  * FOR cones.

---

## `script_228_sensorViewerSelectedSensorOnly.m`

Purpose:

* Show only one selected sensor on a satellite.

---

## `script_229_sensorViewerAllSensors.m`

Purpose:

* Show all sensors mounted on a satellite.

---

## `script_230_sensorViewerWithScheduledTask.m`

Purpose:

* Show sensor pointing for a scheduled task.

---

## `script_231_sensorFORInScenarioAnimation.m`

Purpose:

* Animate a satellite and optionally show its sensor FOR moving with it.

---

# Example Backend Usage

The final backend should support this no-UI workflow:

```matlab
startupOrekitSuite;

cfg = ScenarioConfig();
cfg.Name = "Sensor Viewer Demo";
cfg.Epoch = datetime(2026,1,1,0,0,0,"TimeZone","UTC");
cfg.Duration = hours(2);
cfg.TimeStep = seconds(30);

scenario = MissionScenario(cfg);

sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
sat.BodyModelType = "Cube";
sat.BodyDimensionsMeters = [1.5 1.5 1.5];

sensor = SensorObject("NadirCam", "Sat-1");
sensor.SensorType = "OpticalAgile";
sensor.MountFace = "-Z";
sensor.MountLocationBody = [0 0 -0.75];
sensor.MountNormalBody = [0 0 -1];
sensor.BoresightBody = [0 0 -1];
sensor.FieldOfViewDeg = 5;
sensor.FieldOfRegardDeg = 45;
sensor.MaxSlewRateDegPerSec = 2;

sat = sat.addSensor(sensor);
scenario = scenario.addObject(sat);

opts = SensorViewerOptions();
opts.ShowSatelliteBody = true;
opts.ShowBodyFrame = true;
opts.ShowSensorMounts = true;
opts.ShowBoresight = true;
opts.ShowFOV = true;
opts.ShowFOR = true;
opts.ShowLabels = true;
opts.FOVScale = 1.5;
opts.FORScale = 2.5;

plotSatelliteSensorViewer(scenario, "Sat-1", opts);
```

---

# MVP Implementation Order

Implement this in phases:

## Phase V1 — Static Satellite Cube Viewer

* Draw satellite cube.
* Draw body-frame axes.
* Add `BodyModelType`.
* Add `BodyDimensionsMeters`.

## Phase V2 — Sensor Mount Points

* Add sensor mount properties.
* Draw sensor mount points.
* Draw sensor labels.

## Phase V3 — Boresight Visualization

* Draw boresight arrow from mount point.
* Use `BoresightBody`.

## Phase V4 — FOV Visualization

* Draw narrow FOV cone or pyramid.
* Use `FieldOfViewDeg`.

## Phase V5 — FOR Visualization

* Draw wider FOR cone.
* Use `FieldOfRegardDeg`.
* Add UI checkbox to show/hide FOR.

## Phase V6 — UI Satellite Inspection Mode

* Add satellite dropdown.
* Add sensor dropdown.
* Add FOV/FOR toggles.
* Add refresh viewer button.
* UI calls `plotSatelliteSensorViewer`.

## Phase V7 — Scenario Animation Integration

* Add optional FOV/FOR layers to `animateScenario`.

## Phase V8 — Scheduling Visualization Integration

* Add `plotScheduledSensorTask`.
* Show active sensor pointing and target line for scheduled tasks.

---

# Definition of Done

This feature is complete when the following works without UI:

```matlab
startupOrekitSuite
script_227_satelliteSensorInspectionMode
```

And the script displays:

* A cube satellite.
* Body-frame axes.
* At least two mounted sensors.
* Sensor labels.
* Boresight arrows.
* Toggleable FOV shapes.
* Toggleable FOR shapes.

The UI portion is complete when the user can:

* Select a satellite.
* View the cube satellite.
* See mounted sensors.
* Turn sensor FOV on/off.
* Turn sensor FOR on/off.
* Select one sensor or all sensors.
* Refresh the view.
* Do all of this without any raw plotting logic inside the UI callback.
