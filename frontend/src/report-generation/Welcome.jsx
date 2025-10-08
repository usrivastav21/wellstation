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
        if (isRoleLoggedIn("user")) {
          setStep("dashboard");
          navigate("/booth");
          return;
        }
        navigate("/auth");
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
