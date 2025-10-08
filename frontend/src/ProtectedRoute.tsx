import { Center, Loader } from "@mantine/core";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { isRoleLoggedIn, type Role } from "./api-client";
import { stepAtom, trialIdAtom } from "./atoms";

export const ProtectedRoute = ({
  children,
  redirectTo = "/auth",
  role = "user",
  fallback = null,
}: {
  children: React.ReactNode;
  redirectTo?: string;
  role?: Role;
  fallback?: React.ReactNode;
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
        const isLoggedIn = isRoleLoggedIn(role);

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
  }, [navigate, redirectTo, role, step]);

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
