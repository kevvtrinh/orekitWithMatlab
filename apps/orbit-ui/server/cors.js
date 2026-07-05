// Minimal CORS support so the browser may probe the bridge directly at
// http://127.0.0.1:5175 (e.g. the frontend's stale-dev-server diagnosis when
// the Vite proxy is broken). Deliberately scoped to local dev origins only -
// this server is a localhost dev bridge, not a deployable API.

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

export function isLocalOrigin(origin) {
  return typeof origin === "string" && LOCAL_ORIGIN.test(origin);
}

export function localCors(req, res, next) {
  const origin = req.headers.origin;
  if (isLocalOrigin(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Methods", "GET,PUT,POST,OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
}
