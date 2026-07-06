import { useState } from "react";
import Modal, { FormRow, NumberInput, TextInput } from "../Modal.jsx";
import { groupTargets, taskTemplate } from "../../lib/spec.js";

// Manage the spec's sensor tasks: point-target imaging requests the MATLAB
// scheduler (scheduleSensorTasksGreedy) assigns to satellite sensors on the
// next run. Edits apply when the user saves; validation is shared spec logic.
export default function TasksDialog({ spec, onSubmit, onClose }) {
  const [tasks, setTasks] = useState(() => structuredClone(spec.tasks ?? []));
  const [error, setError] = useState(null);

  const targets = spec.objects.filter((o) => o.kind === "target");
  // Fold area grid points into per-area optgroups so one area's 100 points
  // don't flatten the dropdown.
  const { points: pointTargets, areas: areaGroups } = groupTargets(spec.objects);
  const sensorSats = spec.objects.filter(
    (o) => o.kind === "satellite" && o.sensor,
  );

  const setTask = (index, patch) =>
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    );

  // Selecting an area's "(scan whole area)" option switches the task to
  // ScanAreaTarget against the group name; selecting a point (standalone or
  // an individual grid point) switches back to a plain TrackPointTarget.
  const setTaskTarget = (index, value) =>
    setTask(index, {
      targetName: value,
      taskType: areaGroups.has(value) ? "ScanAreaTarget" : "TrackPointTarget",
    });

  const addTask = () =>
    setTasks((prev) => [...prev, taskTemplate({ ...spec, tasks: prev })]);

  const removeTask = (index) =>
    setTasks((prev) => prev.filter((_, i) => i !== index));

  const submit = async () => {
    const result = await onSubmit(tasks);
    if (result?.errors) setError(result.errors.join(" "));
    else onClose();
  };

  return (
    <Modal
      title="Sensor Tasks"
      onClose={onClose}
      width={520}
      footer={
        <>
          {error && <div className="error-text">{error}</div>}
          <div className="modal-actions">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={submit}>
              Apply
            </button>
          </div>
        </>
      }
    >
      {targets.length === 0 && (
        <div className="empty-note">
          Insert a point target first - tasks image point targets.
        </div>
      )}
      {sensorSats.length === 0 && (
        <div className="empty-note">
          No satellite has a sensor yet. Add one in the satellite dialog to
          give the scheduler something to task.
        </div>
      )}

      {tasks.map((task, i) => (
        <fieldset className="task-card" key={task.id ?? i}>
          <legend>
            {task.id}
            <button
              className="btn btn--icon btn--danger"
              style={{ marginLeft: 8 }}
              onClick={() => removeTask(i)}
              title="Remove this task"
            >
              Del
            </button>
          </legend>
          <FormRow label="Name">
            <TextInput
              value={task.name ?? ""}
              onChange={(v) => setTask(i, { name: v })}
              placeholder={task.id}
            />
          </FormRow>
          <FormRow label="Target">
            <select
              className="input"
              value={task.targetName}
              onChange={(e) => setTaskTarget(i, e.target.value)}
            >
              {pointTargets.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
              {[...areaGroups.entries()].map(([group, points]) => (
                <optgroup key={group} label={`${group} (area)`}>
                  <option value={group}>{`Scan whole area (${points.length} pts)`}</option>
                  {points.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </FormRow>
          <FormRow
            label="Satellite"
            hint="Which satellite's sensor must perform the task; Any lets the scheduler pick"
          >
            <select
              className="input"
              value={task.satelliteName ?? ""}
              onChange={(e) => setTask(i, { satelliteName: e.target.value })}
            >
              <option value="">Any</option>
              {sensorSats.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormRow>
          <FormRow
            label="Dwell (s)"
            hint={
              task.taskType === "ScanAreaTarget"
                ? "Minimum time per covered grid point"
                : "Required time on target"
            }
          >
            <NumberInput
              value={task.dwellSeconds}
              onChange={(v) => setTask(i, { dwellSeconds: v })}
              min={10}
            />
          </FormRow>
          {task.taskType === "ScanAreaTarget" && (
            <FormRow
              label="Coverage (%)"
              hint="Minimum area grid-point coverage to accept a scan window"
            >
              <NumberInput
                value={task.requiredCoveragePercent ?? 70}
                onChange={(v) => setTask(i, { requiredCoveragePercent: v })}
                min={0}
                max={100}
              />
            </FormRow>
          )}
          <FormRow label="Priority" hint="Higher wins scheduling conflicts">
            <NumberInput
              value={task.priority}
              onChange={(v) => setTask(i, { priority: v })}
              min={0}
            />
          </FormRow>
        </fieldset>
      ))}

      <div style={{ paddingTop: 8 }}>
        <button
          className="btn"
          onClick={addTask}
          disabled={targets.length === 0}
        >
          Add Task
        </button>
      </div>
      <div className="hint-text" style={{ paddingTop: 6 }}>
        Tasks are scheduled by MATLAB on the next run: the scheduler picks
        access windows inside each sensor's field of regard, accounts for
        slew time, and the 3D view shows the sensor tracking the target
        during scheduled windows.
      </div>
    </Modal>
  );
}
