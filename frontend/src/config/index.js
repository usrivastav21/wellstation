// Get the backend port from Electron (if available) or fall back to environment variable
const getBackendPort = () => {
  console.log("getBackendPort called");
  console.log("window.electron available:", !!window.electron);

  // In Electron environment, get port from main process
  if (window.electron) {
    try {
      const port = window.electron.getPort();
      console.log(`Electron: Got backend port from main process: ${port}`);
      if (port && port > 0) {
        return port;
      } else {
        console.warn("Electron: Invalid port received:", port);
      }
    } catch (error) {
      console.warn("Electron: Failed to get port from main process:", error);
    }
  } else {
    console.log("Not running in Electron environment");
  }

  // Fallback for development without Electron - use environment-specific port
  const fallbackPort = import.meta.env.VITE_BACKEND_PORT || 3001;
  console.log(`Using fallback port: ${fallbackPort}`);
  return fallbackPort;
};

const getBackendUrl = () => {
  const port = getBackendPort();
  const url = `http://localhost:${port}/api`;
  console.log(`Backend URL: ${url}`);
  return url;
};

const config = {
  API_URL: getBackendUrl(),
  ENV: import.meta.env.VITE_NODE_ENV,
  REPORT_URL: import.meta.env.VITE_REPORT_URL || (import.meta.env.DEV ? "http://localhost:3000/#/report" : "https://reportsui.z23.web.core.windows.net"),
  BACKEND_PORT: getBackendPort(),
};

// Debug logging
console.log("Config REPORT_URL:", config.REPORT_URL);
console.log("VITE_REPORT_URL env:", import.meta.env.VITE_REPORT_URL);
console.log("Is development mode:", import.meta.env.DEV);

export { config };
