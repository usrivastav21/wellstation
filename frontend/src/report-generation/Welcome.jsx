import { Center, Image, Stack, Text } from "@mantine/core";
import { useNavigate } from "react-router";
import wellStationLogo from "../assets/well_station_logo.png";
import { isRoleLoggedIn } from "../api-client";
import { useSetAtom } from "jotai";
import { stepAtom } from "../atoms";

export const Welcome = () => {
  const navigate = useNavigate();
  const setStep = useSetAtom(stepAtom);
  return (
    <Center
      h={"100%"}
      onClick={() => {
        // OLD BEHAVIOR: Users went to dashboard, non-logged in to /auth
        // if (isRoleLoggedIn("user") || isRoleLoggedIn("admin")) {
        //   setStep("dashboard");
        //   navigate("/booth");
        //   return;
        // }
        // navigate("/auth");
        
        // NEW BEHAVIOR: Everyone goes to wellbeing-info page
        // Admin will see "Proceed to Scan", others see login options
        if (isRoleLoggedIn("user")) {
          setStep("dashboard");
          navigate("/booth");
          return;
        }
        if (isRoleLoggedIn("admin")) {
          navigate("/wellbeing-info");
          return;
        }
        navigate("/wellbeing-info");
      }}
    >
      <Stack gap={96} align="center">
        <Image src={wellStationLogo} h={214} w={968} alt="Logo" />
        <Text c="var(--mantine-color-brandDark-6)" fz="4xl">
          Press Anywhere To Proceed
        </Text>
        <Text fz="4xl" ta="center" fw="bolder">
          Beta - Help us test and provide feedback
        </Text>
      </Stack>
    </Center>
  );
};
