import React from "react";

export function AuthoringDialogs({
  dialog,
  scene,
  isBusy,
  onClose,
  onSubmit,
}) {
  if (!dialog) return null;

  const formByDialog = {
    newScenario: (
      <NewScenarioForm scene={scene} isBusy={isBusy} onSubmit={onSubmit} />
    ),
    addSatellite: (
      <SatelliteForm scene={scene} isBusy={isBusy} onSubmit={onSubmit} />
    ),
    addPlace: <PlaceForm isBusy={isBusy} onSubmit={onSubmit} />,
  };
  const titleByDialog = {
    newScenario: "New scenario",
    addSatellite: "Add satellite",
    addPlace: "Add place",
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="authoring-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={titleByDialog[dialog]}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <p>Scenario authoring</p>
            <h2>{titleByDialog[dialog]}</h2>
          </div>
          <button
            className="dialog-close"
            disabled={isBusy}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        {formByDialog[dialog]}
      </section>
    </div>
  );
}

function NewScenarioForm({ scene, isBusy, onSubmit }) {
  const startEpochUnix_s = Number(scene?.startEpochUnix_s) || Date.now() / 1000;
  const stopEpochUnix_s = Number(scene?.stopEpochUnix_s) ||
    startEpochUnix_s + 6 * 3600;

  function submit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    onSubmit("newScenario", {
      Name: values.get("name"),
      StartEpochUnix_s: utcInputToUnix(values.get("startEpoch")),
      StopEpochUnix_s: utcInputToUnix(values.get("stopEpoch")),
    });
  }

  return (
    <form onSubmit={submit}>
      <FormField label="Name" name="name" defaultValue="Untitled Scenario" />
      <div className="form-grid form-grid--two">
        <FormField
          label="Start epoch (UTC)"
          name="startEpoch"
          type="datetime-local"
          defaultValue={unixToUtcInput(startEpochUnix_s)}
        />
        <FormField
          label="Stop epoch (UTC)"
          name="stopEpoch"
          type="datetime-local"
          defaultValue={unixToUtcInput(stopEpochUnix_s)}
        />
      </div>
      <DialogActions
        label="Create scenario"
        busyLabel="Creating scenario…"
        isBusy={isBusy}
      />
    </form>
  );
}

function SatelliteForm({ scene, isBusy, onSubmit }) {
  const satelliteCount = normalizeArray(scene?.satellites).length;
  const epochUnix_s = Number(scene?.startEpochUnix_s) || Date.now() / 1000;

  function submit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    onSubmit("addSatellite", {
      Name: values.get("name"),
      EpochUnix_s: utcInputToUnix(values.get("epoch")),
      Altitude_m: numberValue(values, "altitude_km") * 1000,
      Eccentricity: numberValue(values, "eccentricity"),
      Inclination_deg: numberValue(values, "inclination_deg"),
      Raan_deg: numberValue(values, "raan_deg"),
      ArgumentOfPerigee_deg: numberValue(values, "argumentOfPerigee_deg"),
      TrueAnomaly_deg: numberValue(values, "trueAnomaly_deg"),
    });
  }

  return (
    <form onSubmit={submit}>
      <div className="form-grid form-grid--two">
        <FormField
          label="Name"
          name="name"
          defaultValue={`Satellite ${satelliteCount + 1}`}
        />
        <FormField
          label="Epoch (UTC)"
          name="epoch"
          type="datetime-local"
          defaultValue={unixToUtcInput(epochUnix_s)}
        />
      </div>
      <p className="form-section-title">Classical orbital elements</p>
      <div className="form-grid form-grid--two">
        <FormField label="Altitude (km)" name="altitude_km" defaultValue="500" />
        <FormField
          label="Eccentricity"
          name="eccentricity"
          defaultValue="0"
          step="any"
        />
        <FormField
          label="Inclination (deg)"
          name="inclination_deg"
          defaultValue="51.6"
          step="any"
        />
        <FormField label="RAAN (deg)" name="raan_deg" defaultValue="0" step="any" />
        <FormField
          label="Argument of perigee (deg)"
          name="argumentOfPerigee_deg"
          defaultValue="0"
          step="any"
        />
        <FormField
          label="True anomaly (deg)"
          name="trueAnomaly_deg"
          defaultValue="0"
          step="any"
        />
      </div>
      <p className="form-help">
        Altitude is the semi-major-axis altitude above the WGS84 equator.
        MATLAB uses Orekit to create the authoritative ITRF state.
      </p>
      <DialogActions
        label="Add satellite"
        busyLabel="Creating satellite…"
        isBusy={isBusy}
      />
    </form>
  );
}

function PlaceForm({ isBusy, onSubmit }) {
  function submit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    onSubmit("addPlace", {
      Name: values.get("name"),
      Latitude_deg: numberValue(values, "latitude_deg"),
      Longitude_deg: numberValue(values, "longitude_deg"),
      Altitude_m: numberValue(values, "altitude_m"),
    });
  }

  return (
    <form onSubmit={submit}>
      <FormField label="Name" name="name" defaultValue="Columbus, Ohio" />
      <div className="form-grid form-grid--three">
        <FormField
          label="Latitude (deg)"
          name="latitude_deg"
          defaultValue="39.9612"
          step="any"
        />
        <FormField
          label="Longitude (deg)"
          name="longitude_deg"
          defaultValue="-82.9988"
          step="any"
        />
        <FormField
          label="Altitude (m)"
          name="altitude_m"
          defaultValue="275"
          step="any"
        />
      </div>
      <DialogActions
        label="Add place"
        busyLabel="Adding place…"
        isBusy={isBusy}
      />
    </form>
  );
}

function FormField({ label, name, type, ...inputProps }) {
  const inputType = type ?? (name === "name" ? "text" : "number");
  return (
    <label className="form-field">
      <span>{label}</span>
      <input name={name} type={inputType} required {...inputProps} />
    </label>
  );
}

function DialogActions({ label, busyLabel, isBusy }) {
  return (
    <footer className="dialog-actions">
      {isBusy && <span className="command-progress">MATLAB is updating…</span>}
      <button className="primary-action" type="submit" disabled={isBusy}>
        {isBusy ? busyLabel : label}
      </button>
    </footer>
  );
}

function numberValue(values, name) {
  return Number(values.get(name));
}

function unixToUtcInput(epochUnix_s) {
  return new Date(epochUnix_s * 1000).toISOString().slice(0, 16);
}

function utcInputToUnix(value) {
  return new Date(`${value}Z`).getTime() / 1000;
}

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
