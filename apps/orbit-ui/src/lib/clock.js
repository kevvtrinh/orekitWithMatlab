// Simulation clock as a tiny external store so the 3D loop can drive time at
// frame rate without routing every tick through React state.

const state = {
  tSec: 0, // offset from scenario epoch, seconds
  durationSec: 0,
  playing: false,
  speed: 60, // sim seconds per wall second
};

let snapshot = { ...state };
const listeners = new Set();

function commit() {
  snapshot = { ...state };
  for (const fn of listeners) fn();
}

export const clock = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getSnapshot() {
    return snapshot;
  },
  configure(durationSec) {
    state.durationSec = durationSec;
    state.tSec = Math.min(state.tSec, durationSec);
    commit();
  },
  setTime(tSec) {
    state.tSec = Math.max(0, Math.min(tSec, state.durationSec));
    commit();
  },
  setPlaying(playing) {
    state.playing = playing;
    // Restart from the beginning when play is hit at the end of the span.
    if (playing && state.tSec >= state.durationSec) state.tSec = 0;
    commit();
  },
  setSpeed(speed) {
    state.speed = speed;
    commit();
  },
  // Called from the render loop with elapsed wall-clock seconds.
  tick(dtWallSec) {
    if (!state.playing || state.durationSec <= 0) return;
    const next = state.tSec + dtWallSec * state.speed;
    if (next >= state.durationSec) {
      state.tSec = state.durationSec;
      state.playing = false;
    } else {
      state.tSec = next;
    }
    commit();
  },
};
