import { getTokenData, isTokenExpired } from "./jwt";

const TOKEN_KEY = "auth_tokens";

export const setAuthToken = (data) => {
  if (!data.token || !data.role) return;

  // Get existing tokens or initialize empty object
  const existingTokens = JSON.parse(localStorage.getItem(TOKEN_KEY) || "{}");

  // Update tokens with new token for the role
  const updatedTokens = {
    ...existingTokens,
    [data.role]: {
      token: data.token,
      role: data.role,
      ...(data.email && { email: data.email }),
      ...(data.userName && { userName: data.userName }),
      ...(data.launch && { launch: data.launch }),
      ...(data.age && { age: data.age }),
      ...(data.gender && { gender: data.gender }),
    },
  };

  localStorage.setItem(TOKEN_KEY, JSON.stringify(updatedTokens));
};

export const getAuthToken = (role) => {
  const tokens = JSON.parse(localStorage.getItem(TOKEN_KEY) || "{}");
  return tokens[role]?.token;
};

export const removeAuthToken = (role) => {
  const tokens = JSON.parse(localStorage.getItem(TOKEN_KEY) || "{}");
  if (role) {
    // Remove specific role token
    delete tokens[role];
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  } else {
    // Remove all tokens
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getCurrentRoleData = (role) => {
  const tokens = JSON.parse(localStorage.getItem(TOKEN_KEY) || "{}");

  return tokens[role] || null;
};

export const isRoleLoggedIn = (role) => {
  const tokens = JSON.parse(localStorage.getItem(TOKEN_KEY) || "{}");
  const roleToken = tokens[role]?.token;

  if (!roleToken) {
    return false;
  }

  // Check if token is expired
  const isExpired = isTokenExpired(roleToken);

  if (isExpired) {
    // Remove expired token
    removeAuthToken(role);
    return false;
  }

  return true;
};

export const logoutUser = () => {
  removeAuthToken("user");
};

export const isPinChangeRequired = (role = "user") => {
  const tokens = JSON.parse(localStorage.getItem(TOKEN_KEY) || "{}");
  const roleToken = tokens[role]?.token;

  if (!roleToken) {
    return false;
  }

  const tokenData = getTokenData(roleToken);
  if (!tokenData) {
    return false;
  }

  return tokenData.is_temp_pin;
};
