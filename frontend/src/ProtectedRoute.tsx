import { Center, Loader } from "@mantine/core";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { isRoleLoggedIn, type Role } from "./api-client";
import { stepAtom, trialIdAtom } from "./atoms";

export const ProtectedRoute = ({
  children,
  redirectTo = "/wellbeing-info",
  role = "user",
  fallback = null,
  allowAdminAccess = false, // NEW: Allow admin to access user-protected routes
}: {
  children: React.ReactNode;
  redirectTo?: string;
  role?: Role;
  fallback?: React.ReactNode;
  allowAdminAccess?: boolean; // NEW: Allow admin to access user-protected routes
}) => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const step = useAtomValue(stepAtom);
  const trialId = useAtomValue(trialIdAtom);
  const location = useLocation();
  const isTrialGoingOn = !!location.state?.isTrial || !!trialId;

  useEffect(() => {
    const checkAuth = () => {
      try {
        // OLD BEHAVIOR: Only check for specified role
        // const isLoggedIn = isRoleLoggedIn(role);
        
        // NEW BEHAVIOR: Check for specified role OR admin if allowAdminAccess is true
        let isLoggedIn = isRoleLoggedIn(role);
        
        // If not logged in as the specified role but allowAdminAccess is true, check if admin is logged in
        if (!isLoggedIn && allowAdminAccess) {
          isLoggedIn = isRoleLoggedIn('admin');
        }

        if (
          !isLoggedIn &&
          step !== "consentForm" &&
          step !== "welcome" &&
          !isTrialGoingOn
        ) {
          void navigate(redirectTo);
          return;
        }

        setIsReady(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        void navigate(redirectTo);
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, redirectTo, role, step, allowAdminAccess]);

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
