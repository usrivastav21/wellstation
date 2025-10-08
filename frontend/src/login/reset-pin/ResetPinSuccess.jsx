import { Button, Center, Stack, Text } from "@mantine/core";
import { GreenTickMarkIcon } from "../../assets";
import { useNavigate } from "react-router";
import { LoginHeader } from "../LoginHeader";

export const ResetPinSuccess = () => {
  const navigate = useNavigate();

  return (
    <Center h={"100%"}>
      <Stack
        maw={694}
        mah={748}
        bdrs={32}
        bg="white"
        p={32}
        gap={12}
        bd={"4px solid var(--mantine-color-brand-6)"}
      >
        <LoginHeader title="Reset Pin" image={GreenTickMarkIcon} />
        <Stack gap={48}>
          <Text fz="2xl">Please check your email to reset your pin.</Text>
          <Button
            bdrs={"lg"}
            fullWidth
            variant="brand-filled"
            fz={"4xl"}
            size="xxl"
            fw="bold"
            bd={"4px solid var(--mantine-color-text-9)"}
            onClick={() => {
              navigate("/auth/login");
            }}
          >
            Back
          </Button>
        </Stack>
      </Stack>
    </Center>
  );
};
