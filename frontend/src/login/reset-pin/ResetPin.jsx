import { Text, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod/v4";
import {
  Email,
  EMAIL_SUFFIX,
  NEERAJ_EMAIL,
  PRANAV_EMAIL,
} from "../../form-inputs";
import { LoginHeader } from "../LoginHeader";
import { Center, Stack, Button } from "@mantine/core";
import { useResetPin } from "./useResetPin";
import { useNavigate } from "react-router";

export const ResetPin = () => {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(
      z
        .object({
          email: z.string().min(1, { message: "Please enter a valid email" }),
        })
        .check((ctx) => {
          if (
            !z.email().safeParse(ctx.value.email + EMAIL_SUFFIX).success &&
            ctx.value.email !== NEERAJ_EMAIL &&
            ctx.value.email !== PRANAV_EMAIL
          ) {
            ctx.issues.push({
              message: "Please enter a valid company email",
              path: ["email"],
            });
          }
        })
    ),
  });

  const resetPin = useResetPin({
    onSuccess: () => {
      navigate("/reset-pin/success");
    },
  });

  const onSubmit = (data) => {
    const payload = {
      email:
        data.email !== NEERAJ_EMAIL && data.email !== PRANAV_EMAIL
          ? data.email + EMAIL_SUFFIX
          : data.email,
    };
    resetPin.mutate(payload);
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
        <VStack rowGap={8}>
          <LoginHeader title="Reset Pin" />
          <Text fontSize={"3xl"} fontWeight={"bold"}>
            Please enter the email address you have used to register.
          </Text>
        </VStack>
        <VStack
          as="form"
          w={"100%"}
          rowGap={12}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Email {...field} error={errors.email?.message} />
            )}
          />
          <Button
            type="submit"
            w={"100%"}
            variant={"brand-filled"}
            bdrs={"lg"}
            bd={"4px solid var(--mantine-color-text-9)"}
            fw={"bold"}
            size="xl"
            py={8}
            px={12}
            loading={resetPin.isPending}
            disabled={resetPin.isPending}
          >
            Send
          </Button>
        </VStack>
      </Stack>
    </Center>
  );
};
