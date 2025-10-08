import { zodResolver } from "@hookform/resolvers/zod";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod/v4";

import { stepAtom, ageAtom, selectedGenderAtom, userIdAtom } from "../atoms";
import {
  Email,
  EMAIL_SUFFIX,
  NEERAJ_EMAIL,
  PRANAV_EMAIL,
} from "../form-inputs";
import { LoginHeader } from "./LoginHeader";
import { useLogin } from "./useLogin";
import { Stack, Text, Button, PinInput, Center } from "@mantine/core";
import { getTokenData } from "../api-client";

export const UserLogin = () => {
  const navigate = useNavigate();
  const setStep = useSetAtom(stepAtom);
  const setAge = useSetAtom(ageAtom);
  const setGender = useSetAtom(selectedGenderAtom);
  const setUserId = useSetAtom(userIdAtom);
  const [apiError, setApiError] = useState(null);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      email: "",
      pin: "",
    },
    resolver: zodResolver(
      z
        .object({
          email: z.string().min(1, "Please enter a valid email"),
          pin: z.string().length(6, "Please enter a valid pin"),
        })
        .check((data, ctx) => {
          const fullEmail = data.email + EMAIL_SUFFIX;
          if (
            !z.string().email().safeParse(fullEmail).success &&
            data.email !== NEERAJ_EMAIL &&
            data.email !== PRANAV_EMAIL
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Please enter a valid company email",
              path: ["email"],
            });
          }
        })
    ),
  });

  const { mutate: login, isPending } = useLogin({
    onSuccess: (data) => {
      console.log("data", data);
      setAge(data.user.age);
      setGender(data.user.gender);

      if (data.requires_pin_change) {
        const tokenData = getTokenData(data.token);
        setUserId(tokenData.user_id);
        navigate("/change-pin");
        return;
      }

      setStep("dashboard");
      navigate("/booth");
    },
    onError: (error) => {
      console.log(error);
      if (error.response.status === 403) {
        navigate("/auth");
      }
      if (error.response.status === 401) {
        setApiError("Invalid email or pin. Please try again.");
      }
    },
  });

  const onSubmit = (data) => {
    setApiError(null);
    const payload = {
      email:
        data.email !== NEERAJ_EMAIL && data.email !== PRANAV_EMAIL
          ? data.email + EMAIL_SUFFIX
          : data.email,
      pin: data.pin,
      role: "user",
    };

    login(payload);
  };

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
        <LoginHeader title="User Login" />

        {apiError ? (
          <Text ta="center" my={12} fz="xl" c="#f53d67">
            {apiError}
          </Text>
        ) : null}

        <Stack component="form" w="100%" onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={24}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => {
                return <Email {...field} error={errors.email?.message} />;
              }}
            />

            <Controller
              control={control}
              name="pin"
              render={({ field }) => (
                <Stack gap={0}>
                  <Text component="label" fz="3xl" fw="bold">
                    Pin
                  </Text>
                  <PinInput
                    length={6}
                    type="alphanumeric"
                    size="xl"
                    mask
                    {...field}
                    error={errors.pin?.message}
                  />
                  {errors.pin?.message ? (
                    <Text
                      fz="lg"
                      lh={1.2}
                      ff="Lato"
                      c="var(--mantine-color-error)"
                      mt={5}
                    >
                      {errors.pin?.message}
                    </Text>
                  ) : null}
                </Stack>
              )}
            />
            <Button
              variant="white"
              size="xl"
              fw={"bold"}
              onClick={() => {
                navigate("/reset-pin");
              }}
            >
              Forgot Pin?
            </Button>
          </Stack>
          <Button
            mt={40}
            mx="auto"
            bdrs={"lg"}
            fullWidth
            variant="brand-filled"
            fz={"4xl"}
            fw="bold"
            size="xxl"
            loading={isPending}
            disabled={isPending}
            type="submit"
            bd={"4px solid var(--mantine-color-text-9)"}
          >
            Login
          </Button>
        </Stack>
      </Stack>
    </Center>
  );
};
