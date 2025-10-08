import { useDisclosure } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, PinInput, rem, Stack, Text, Box } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { z } from "zod/v4";

import { MonthPickerInput } from "@mantine/dates";
import { formatDate } from "date-fns";
import { useAtomValue, useSetAtom } from "jotai";
import { GreenTickMarkIcon } from "../assets/icons";
import { stepAtom, trialIdAtom } from "../atoms";
import { AlertDialog, SuccessAlertDialog } from "../design-system";
import {
  Email,
  EMAIL_SUFFIX,
  NEERAJ_EMAIL,
  PRANAV_EMAIL,
  genderOptions,
  GenderSelection,
} from "../form-inputs";
import { useRegister } from "./useRegister";

export const Registration = () => {
  const setStep = useSetAtom(stepAtom);
  const trialId = useAtomValue(trialIdAtom);

  const location = useLocation();
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    setError,
  } = useForm({
    defaultValues: {
      emailUser: "",
      pin: "",
      confirmPin: "",
      gender: "",
      dateOfBirth: null,
    },
    resolver: zodResolver(
      z
        .object({
          emailUser: z.string().min(1, "Please enter a valid email"),
          pin: z.string().length(6, "Please enter a valid pin"),
          confirmPin: z.string().length(6, "Please enter a valid pin"),
          gender: z.enum(genderOptions, {
            error: () => ({ message: "Please select a gender" }),
          }),
          dateOfBirth: z.iso.date({
            error: () => ({ message: "Please select a date of birth" }),
          }),
        })
        .refine((data) => data.pin === data.confirmPin, {
          path: ["confirmPin"],
          message: "Please enter a correct pin",
        })
        .superRefine((data, ctx) => {
          const fullEmail = data.emailUser + EMAIL_SUFFIX;

          if (
            !z.string().email().safeParse(fullEmail).success &&
            data.emailUser !== NEERAJ_EMAIL &&
            data.emailUser !== PRANAV_EMAIL
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Please enter a valid company email",
              path: ["emailUser"],
            });
          }
        })
    ),
  });

  const { mutate: register, isPending } = useRegister({
    onSuccess: () => {
      // setReportId(uuidv4());
      onSuccessOpen();
    },
    onError: (error) => {
      if (error.response.status === 409) {
        setError("emailUser", {
          message: "Email already registered",
        });
      }
    },
  });

  const onSubmit = (data) => {
    const payload = {
      email:
        data.emailUser !== NEERAJ_EMAIL && data.emailUser !== PRANAV_EMAIL
          ? data.emailUser + EMAIL_SUFFIX
          : data.emailUser,
      pin: data.pin,
      confirmPin: data.confirmPin,
      gender: data.gender,
      dateOfBirth: formatDate(data.dateOfBirth, "yyyy-MM"),
      ...(location.state?.isTrial && { trial_id: trialId }),
    };
    console.log(payload);
    register(payload);
  };

  console.log(errors, watch());
  return (
    <Box>
      <Stack gap={0} align={"flex-start"} justify="center">
        <Text fz="4xl" fw="bold" ta="center" w="100%">
          Registration
        </Text>

        <Stack gap={0} component="form" w="100%">
          <Stack gap={rem(24)} w="100%">
            <Controller
              control={control}
              name="emailUser"
              render={({ field }) => (
                <Email
                  {...field}
                  maw={rem(820)}
                  label={
                    <Text fz="3xl" fw="bold" ff="Lato">
                      Company Email
                    </Text>
                  }
                  error={errors.emailUser?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="pin"
              render={({ field }) => (
                <Stack gap="xs">
                  <Text component="label" fz="3xl" fw="bold">
                    Pin
                  </Text>
                  <PinInput
                    length={6}
                    type="alphanumeric"
                    mask
                    size="xl"
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
                    mask
                    size="xl"
                    length={6}
                    type="alphanumeric"
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

          <Stack gap={rem(24)} mt={rem(48)}>
            <Text fz="2xl" fw={"bold"} ta={"center"}>
              Please provide your{" "}
              <Text fz="2xl" component="span" c={"brandDark.6"}>
                Gender
              </Text>{" "}
              and{" "}
              <Text fz="2xl" component="span" c={"brandDark.6"}>
                {" "}
                Date Of Birth
              </Text>{" "}
              to receive an accurate and personalised report.
            </Text>

            <Group justify="space-between">
              <Group>
                <Text fz={"4xl"} fw={"bold"}>
                  Gender
                </Text>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <GenderSelection {...field} error={errors.gender} />
                  )}
                />
              </Group>

              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <Group gap={40}>
                    <Text fz="4xl" fw="bold">
                      Month and Year of Birth
                    </Text>
                    <MonthPickerInput
                      w={rem(364)}
                      label=""
                      defaultLevel="decade"
                      placeholder="YYYY/MM"
                      size="xl"
                      {...field}
                      error={
                        errors.dateOfBirth?.message ? (
                          <Text
                            component="span"
                            fz="lg"
                            ff="Lato"
                            c="var(--mantine-color-error)"
                          >
                            {errors.dateOfBirth?.message}
                          </Text>
                        ) : null
                      }
                    />
                  </Group>
                )}
              />
            </Group>
          </Stack>

          <Button
            mt={40}
            mx="auto"
            bdrs={"lg"}
            w={656}
            variant="brand-filled"
            bd={"4px solid var(--mantine-color-text-9)"}
            fz={"4xl"}
            fw="bold"
            size="xxl"
            loading={isPending}
            disabled={isPending}
            onClick={async () => {
              const isValid = await trigger();
              if (isValid) {
                onOpen();
              }
            }}
          >
            Create Profile
          </Button>
          <AlertDialog
            description="You will be unable to change your Gender and Date of Birth once you confirm."
            onClose={onClose}
            onConfirm={() => {
              onClose();
              handleSubmit(onSubmit)();
            }}
            isOpen={isOpen}
          />
          <SuccessAlertDialog
            isOpen={isSuccessOpen}
            onClose={() => {
              onSuccessClose();
              if (location.state?.isTrial) {
                navigate("/booth");
                setStep("report");
                return;
              }
              setStep("dashboard");
              navigate("/booth");
            }}
            icon={GreenTickMarkIcon}
            description={"Profile created successfully!"}
          />
        </Stack>
      </Stack>
    </Box>
  );
};
