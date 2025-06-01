import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const conditionalPlugins: [string, Record<string, any>][] = [];

// @ts-ignore
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
}

// Dynamically import tempo plugin only when needed
function loadTempoPlugin() {
  try {
    // @ts-ignore
    if (process.env.TEMPO === "true") {
      const { tempo } = require("tempo-devtools/dist/vite");
      return tempo();
    }
    return null;
  } catch (e) {
    console.warn("Failed to load tempo plugin:", e);
    return null;
  }
}

const tempoPlugin = loadTempoPlugin();

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
    react({
      plugins: conditionalPlugins,
    }),
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
    allowedHosts: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      // Ensure external dependencies are properly handled
      external: [/^tempo-devtools/],
    },
  },
});
