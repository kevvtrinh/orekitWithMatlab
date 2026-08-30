async function requestJson(path, options = {}) {
  const response = await fetch(path, { cache: "no-store", ...options });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || `HTTP ${response.status}`);
  }
  return body;
}

export function loadScene() {
  return requestJson("/api/scene");
}

export function sendCommand(command, payload = {}) {
  return requestJson("/api/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command, payload }),
  });
}
