import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = (env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

  const proxy = {
    "/api": { target, changeOrigin: true },
    "/uploads": { target, changeOrigin: true },
    "/socket.io": { target, ws: true, changeOrigin: true },
  };

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy,
    },
    preview: {
      port: 4173,
      proxy,
    },
  };
});
