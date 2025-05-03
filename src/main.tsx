import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

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

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Initialize Firebase with environment variables
import "./lib/firebase";

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
