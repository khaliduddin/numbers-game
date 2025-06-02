import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
// Import Telegram Web App SDK
import WebApp from "@twa-dev/sdk";

// Configure environment-based logging
const APP_ENV = import.meta.env.MODE || "development";
if (APP_ENV === "production" || APP_ENV === "preprod") {
  // Disable console logs in production and pre-production environments
  const noop = () => {};
  // Store original console methods for potential selective use
  const originalConsole = { ...console };

  // Override console methods except for error and warn
  console.log = noop;
  console.debug = noop;
  console.info = noop;

  // Keep error and warn for critical issues
  // console.error = noop; // Uncomment to disable error logs too
  // console.warn = noop; // Uncomment to disable warning logs too

  // Add a method to temporarily enable logs for debugging if needed
  window.enableLogs = () => {
    console.log = originalConsole.log;
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.log("Logs temporarily enabled");
  };
}

// Initialize Tempo Devtools if available
if (import.meta.env.VITE_TEMPO === "true") {
  try {
    import("tempo-devtools")
      .then((module) => {
        const { TempoDevtools } = module;
        if (TempoDevtools) {
          TempoDevtools.init();
          console.log("Tempo devtools initialized");
        } else {
          console.warn("TempoDevtools not found in the module");
        }
      })
      .catch((error) => {
        console.warn("Tempo devtools not available:", error);
      });
  } catch (error) {
    console.warn("Tempo devtools not available:", error);
  }
}

// Initialize Firebase with environment variables
import "./lib/firebase";
import { useFirebaseEmulators } from "./lib/useFirebaseEmulators";

// Only connect to Firebase emulators in development mode if explicitly enabled
const enableEmulators =
  localStorage.getItem("enableFirebaseEmulators") === "true";
if (enableEmulators) {
  useFirebaseEmulators();
} else {
  console.log(
    'Firebase emulators not enabled. Set localStorage.enableFirebaseEmulators = "true" to enable.',
  );
}

// Add offline detection message
window.addEventListener("offline", () => {
  console.warn("⚠️ Application is offline. Some features may be limited.");
});

window.addEventListener("online", () => {
  console.log("✅ Application is back online.");
});

// Initialize Telegram Web App if available
try {
  // This will throw an error if not running in Telegram
  if (WebApp.initDataUnsafe) {
    // Set viewport correctly for Telegram Mini App
    WebApp.ready();
    WebApp.expand();

    // Log Telegram initialization
    console.log("Telegram Web App initialized");
    if (WebApp.initDataUnsafe.user) {
      console.log("Telegram user:", WebApp.initDataUnsafe.user);
    }
  }
} catch (e) {
  console.log("Not running as Telegram Mini App");
}

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
