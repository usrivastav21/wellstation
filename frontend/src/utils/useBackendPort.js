import { useEffect, useState } from "react";
import { updateApiBaseUrl } from "../api-client/axios-instance";
import { config } from "../config";

export const useBackendPort = () => {
  const [backendPort, setBackendPort] = useState(config.BACKEND_PORT);
  const [apiUrl, setApiUrl] = useState(config.API_URL);

  useEffect(() => {
    // Function to update port and API URL
    const updatePort = () => {
      const newPort = config.BACKEND_PORT;
      const newApiUrl = config.API_URL;

      if (newPort !== backendPort) {
        console.log(`Backend port changed from ${backendPort} to ${newPort}`);
        setBackendPort(newPort);
        setApiUrl(newApiUrl);

        // Update axios instance base URL
        updateApiBaseUrl();
      }
    };

    // Update immediately
    updatePort();

    // Set up interval to check for port changes (useful for development)
    const interval = setInterval(updatePort, 1000);

    return () => clearInterval(interval);
  }, [backendPort]);

  return {
    backendPort,
    apiUrl,
    isElectron: !!window.electron,
  };
};
