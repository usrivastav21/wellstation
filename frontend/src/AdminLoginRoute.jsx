import { Navigate } from "react-router";
import { isRoleLoggedIn } from "./api-client";

/**
 * Route wrapper for admin login page
 * Redirects to /booth if admin is already logged in
 * This prevents admins from seeing the second login screen after admin login
 */
export const AdminLoginRoute = ({ children }) => {
  // Check if admin is logged in
  const isAdminLoggedIn = isRoleLoggedIn('admin');
  
  // If admin is logged in, redirect to booth (bypass second login)
  if (isAdminLoggedIn) {
    return <Navigate to="/booth" replace />;
  }

  // If not logged in, show the admin login page
  return children;
};

