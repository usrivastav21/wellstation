import { jwtDecode } from "jwt-decode";

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);

    // Check if token has expiration time
    if (!decoded.exp) return true;

    // Get current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token is expired
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

// Get token expiration time in milliseconds
export const getTokenExpirationTime = (token) => {
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return null;

    // Convert expiration time to milliseconds
    return decoded.exp * 1000;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const getTokenData = (token) => {
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
