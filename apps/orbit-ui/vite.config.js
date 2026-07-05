import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Node bridge server (server/index.js) listens on 5175; the Vite dev
// server proxies /api to it so the frontend can use same-origin URLs.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5175",
        changeOrigin: true,
      },
    },
  },
});
