import { Button, Center, Stack, Text } from "@mantine/core";
import { useNavigate } from "react-router";

export const Error = () => {
  const navigate = useNavigate();
  return (
    <Center h="100%">
      <Stack gap={48} align="center">
        <Stack gap={24} align="center">
          <Text fz="4xl" fw="bold" ta="center" maw={874} lh={1.2}>
            We hit a little bump! Let’s start fresh and continue your wellbeing
            journey.
          </Text>
          <Text fz="3xl" fw={"bold"} ta="center" lh={1.2}>
            If you’ve already completed your scan, don’t worry, your results are
            safe.
          </Text>
        </Stack>
        <Button
          size="xl"
          miw={656}
          bd={"4px solid var(--mantine-color-text-9)"}
          bdrs="lg"
          variant="brand-filled"
          onClick={() => {
            navigate("/", { replace: true });
            window.location.reload();
          }}
        >
          Refresh
        </Button>
      </Stack>
    </Center>
  );
};
