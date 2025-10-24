import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { isRoleLoggedIn } from "./api-client";
import { Loader, Center } from "@mantine/core";

/**
 * A public route for /auth and /auth/login pages
 * - Regular users who are logged in get redirected to booth
 * - Admin users can view the page (Login.jsx will show "Proceed To Scan" button)
 * - Non-logged in users can view the page normally
 */
export const AdminAwarePublicRoute = ({
  children,
  redirectTo = "/booth",
  fallback = null,
}) => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // OLD BEHAVIOR: Redirected admin users to booth immediately
        // const isAdminLoggedIn = isRoleLoggedIn('admin');
        // if (isAdminLoggedIn) {
        //   navigate(redirectTo);
        //   return;
        // }
        
        // NEW BEHAVIOR: Allow admin to see the page (Login.jsx handles showing "Proceed To Scan")
        // Only redirect regular users who are logged in
        
        const isUserLoggedIn = isRoleLoggedIn('user');
        
        if (isUserLoggedIn) {
          // Regular user is logged in, redirect to booth
          navigate(redirectTo);
          return;
        }

        // Admin or not logged in - show the page
        setIsReady(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsReady(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, redirectTo]);

  if (isLoading) {
    return (
      fallback || (
        <Center h="100%">
          <Loader size="sm" />
        </Center>
      )
    );
  }

  if (!isReady) return null;

  return children;
};

