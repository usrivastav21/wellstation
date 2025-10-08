export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/register",
    LOGIN: "/login",
  },
  REPORT: {
    GET: (reportId) => `/fetch/report/${reportId}`,
    SEND_EMAIL: "/send/email",
  },
};
