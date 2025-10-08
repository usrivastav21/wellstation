import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { isRoleLoggedIn } from "./api-client";
import { Loader, Center } from "@mantine/core";

export const PublicRoute = ({
  children,
  redirectTo = "/booth",
  role = "user",
  fallback = null,
}) => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isLoggedIn = isRoleLoggedIn(role);

        if (isLoggedIn) {
          navigate(redirectTo);
          return;
        }

        setIsReady(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsReady(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, redirectTo, role]);

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
