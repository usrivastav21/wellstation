import axios from "axios";
import { config } from "../config";
import {
  getAuthToken,
  getCurrentRoleData,
  isTokenExpired,
  removeAuthToken,
} from "./auth";

// Create axios instance with dynamic base URL
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: config.API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const currentRole = getCurrentRoleData("user");
      let token = null;
      if (currentRole?.role) {
        token = getAuthToken(currentRole.role);
      }

      if (config.skipAuth) {
        return config;
      }

      if (token) {
        // Check if token exists and is not expired
        if (isTokenExpired(token)) {
          // if (isTokenExpired(token)) {
          //   // Token is expired, clear tokens and redirect to login
          removeAuthToken("user");
          //   // localStorage.removeItem("boothLoggedInUser");
          //   // localStorage.removeItem("boothVenue");
          if (window.electron) {
            window.location.hash = "#/booth";
          } else {
            window.location.href = "/booth";
          }
          return Promise.reject("Token expired");
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle token expiration
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // if (error.response?.status === 401) {
      //   // Clear all tokens on unauthorized response
      //   removeAuthToken("user");

      //   // Redirect to login page
      //   if (window.electron) {
      //     window.location.hash = "#/booth";
      //   } else {
      //     window.location.href = "/booth";
      //   }
      // }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create initial instance
export let axiosInstance = createAxiosInstance();

// Function to update the base URL when port changes
export const updateApiBaseUrl = () => {
  const newBaseUrl = config.API_URL;
  console.log(`Updating API base URL to: ${newBaseUrl}`);
  axiosInstance.defaults.baseURL = newBaseUrl;
};

// Update base URL when config changes (useful for development)
if (window.electron) {
  // In Electron, the port is already set correctly
  console.log(`Using backend port: ${config.BACKEND_PORT}`);
} else {
  // In development without Electron, we might need to update periodically
  console.log(`Using backend port: ${config.BACKEND_PORT}`);
}
