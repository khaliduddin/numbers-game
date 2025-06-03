import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// Import tempo plugin directly
import * as tempoDevtools from "tempo-devtools/dist/vite";

// Initialize tempo plugin conditionally
let tempoPlugin = null;
try {
  if (process.env.TEMPO === "true" && tempoDevtools) {
    tempoPlugin = tempoDevtools.tempo();
  }
} catch (e) {
  console.warn("Failed to load tempo plugin:", e);
}

// https://vitejs.dev/config/
export default defineConfig({
  base:
    process.env.NODE_ENV === "development"
      ? "/"
      : process.env.NODE_ENV === "preprod"
        ? "/preprod/"
        : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx"],
    exclude: ["tempo-devtools"],
  },
  define: {
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV || "development"),
    // Ensure process.env.NODE_ENV is properly defined in production
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development",
    ),
  },
  plugins: [
    react(),
    // Only add tempo plugin if it was loaded successfully
    tempoPlugin,
  ].filter(Boolean),
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      // Ensure external dependencies are properly handled
      external: [/^tempo-devtools/],
      // Disable sourcemap warnings for problematic dependencies
      onwarn(warning, warn) {
        if (
          warning.code === "SOURCEMAP_ERROR" &&
          warning.message.includes("framer-motion")
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
});
