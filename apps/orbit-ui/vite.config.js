import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Node bridge server (server/index.js) listens on 5175; the Vite dev
// server proxies /api to it so the frontend can use same-origin URLs.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Keep the rendering engine cached when mission UI code changes.
        manualChunks(id) {
          if (id.includes("/node_modules/three/")) return "three";
        },
      },
    },
  },
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
