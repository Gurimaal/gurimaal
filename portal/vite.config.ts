import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const frappeTarget =
    env.VITE_FRAPPE_PROXY_TARGET || env.VITE_FRAPPE_API_URL || "http://localhost:8000";

  return {
    server: {
      proxy: {
        "/api": {
          target: frappeTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
      tanstackStart({
        server: { entry: "server" },
      }),
      react(),
    ],
  };
});
