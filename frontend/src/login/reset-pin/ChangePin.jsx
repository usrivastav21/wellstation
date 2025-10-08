import { Center, Stack, PinInput, Button } from "@mantine/core";
import { Text } from "@mantine/core";
import { LoginHeader } from "../LoginHeader";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useChangePin } from "./useChangePin";
import { useNavigate } from "react-router";
import { useSetAtom } from "jotai";
import { stepAtom } from "../../atoms";
import { GreenTickMarkIcon } from "../../assets";

export const ChangePin = () => {
  const navigate = useNavigate();
  const setStep = useSetAtom(stepAtom);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pin: "",
      confirmPin: "",
    },
    resolver: zodResolver(
      z
        .object({
          pin: z.string().length(6, "Please enter a valid pin"),
          confirmPin: z.string().length(6, "Please enter a valid pin"),
        })
        .refine((data) => data.pin === data.confirmPin, {
          path: ["confirmPin"],
          message: "Please enter a correct pin",
        })
    ),
  });

  const changePin = useChangePin({
    onSuccess: () => {
      setTimeout(() => {
        setStep("dashboard");
        navigate("/booth");
      }, 500);
    },
  });

  const onSubmit = (data) => {
    const payload = {
      new_pin: data.pin,
      confirm_pin: data.confirmPin,
    };

    changePin.mutate(payload);
  };

  return (
    <Center h="100%">
      <Stack
        maw={694}
        mah={748}
        miw={694}
        bdrs={32}
        bg="white"
        p={32}
        gap={12}
        bd={"4px solid var(--mantine-color-brand-6)"}
      >
        <LoginHeader
          title="Change pin"
          image={changePin.isSuccess ? GreenTickMarkIcon : undefined}
        />

        <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={48}>
          <Stack gap={32}>
            <Controller
              control={control}
              name="pin"
              render={({ field }) => (
                <Stack gap="xs">
                  <Text component="label" fz="3xl" fw="bold">
                    New Pin
                  </Text>
                  <PinInput
                    length={6}
                    type="alphanumeric"
                    mask
                    size="xl"
                    style={{
                      alignSelf: "center",
                    }}
                    {...field}
                    error={errors.pin?.message}
                  />
                  {errors.pin?.message ? (
                    <Text fz="lg" ff="Lato" c="var(--mantine-color-error)">
                      {errors.pin?.message}
                    </Text>
                  ) : null}
                </Stack>
              )}
            />

            <Controller
              control={control}
              name="confirmPin"
              render={({ field }) => (
                <Stack gap="xs">
                  <Text component="label" fz="3xl" fw="bold">
                    Re-enter Pin
                  </Text>
                  <PinInput
                    length={6}
                    type="alphanumeric"
                    mask
                    size="xl"
                    style={{
                      alignSelf: "center",
                    }}
                    {...field}
                    error={errors.confirmPin?.message}
                  />
                  {errors.confirmPin?.message ? (
                    <Text fz="lg" ff="Lato" c="var(--mantine-color-error)">
                      {errors.confirmPin?.message}
                    </Text>
                  ) : null}
                </Stack>
              )}
            />
          </Stack>

          <Button
            mx="auto"
            bdrs={"lg"}
            fullWidth
            variant="brand-filled"
            fw="bold"
            size="xxl"
            type="submit"
            bd={"4px solid var(--mantine-color-text-9)"}
            loading={changePin.isPending}
            disabled={changePin.isPending}
          >
            Change Pin
          </Button>
        </Stack>
      </Stack>
    </Center>
  );
};
