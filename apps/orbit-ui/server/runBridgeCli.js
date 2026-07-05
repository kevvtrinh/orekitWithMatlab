// CLI smoke test for the MATLAB bridge: runs the same job the UI button
// triggers, prints the log as it streams, and summarizes the parsed output.
//   node server/runBridgeCli.js
import {
  jobStatus,
  startDemoJob,
  readScenario,
  LIVE_SCENARIO_FILE,
} from "./matlabJob.js";

console.log("Starting MATLAB bridge demo job (this launches matlab -batch)...");

let printed = 0;
function printNewLog() {
  const lines = jobStatus().log;
  for (let i = printed; i < lines.length; i++) {
    console.log(`  ${lines[i]}`);
  }
  printed = lines.length;
}

const poller = setInterval(printNewLog, 2000);

const result = startDemoJob({
  onDone: (status) => {
    clearInterval(poller);
    printNewLog();
    if (status.state === "succeeded") {
      const { scenario } = readScenario();
      console.log(`\nBridge OK -> ${LIVE_SCENARIO_FILE}`);
      console.log(`  scenario:   ${scenario.meta.name}`);
      console.log(`  epoch:      ${scenario.meta.epochUtc}`);
      console.log(`  satellites: ${scenario.satellites.map((s) => s.name).join(", ")}`);
      console.log(
        `  accesses:   ${scenario.accesses
          .map((a) => `${a.source}->${a.target} (${a.windows.length} windows)`)
          .join(", ")}`,
      );
      process.exit(0);
    } else {
      console.error(`\nBridge FAILED: ${status.error}`);
      process.exit(1);
    }
  },
});

if (!result.ok) {
  console.error(result.reason);
  process.exit(1);
}
