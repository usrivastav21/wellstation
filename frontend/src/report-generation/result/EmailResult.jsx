import {
  Box,
  Button,
  Container,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  rem,
} from "@mantine/core";
// import { useDisclosure } from "@mantine/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod/v4";
import { getCurrentRoleData } from "../../api-client/auth";
import { stepAtom, reportIdAtom } from "../../atoms";
import StepCountHeader from "../../components/StepCountHeader";
import { config } from "../../config";
import { Email, TextInput as ChakraTextInput } from "../../form-inputs";
import { MoodFeedback } from "./MoodFeedback";
import { useSendEmail } from "./useSendEmail";

export const EmailResult = () => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const candidateId = useAtomValue(reportIdAtom);
  const setStep = useSetAtom(stepAtom);

  const { mutate: sendEmail, isPending } = useSendEmail({
    onSuccess: () => {
      setStep("report");
    },
  });
  const loggedInUser = getCurrentRoleData("admin");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
    },
    resolver: zodResolver(
      z.object({
        name: z.string().min(1),
        email: z.email({
          message: t("booth.steps.email-result.email-error"),
        }),
      })
    ),
  });

  const onSubmit = (data) => {
    const reportLink = `${
      config.REPORT_URL
    }/${candidateId}?boothVenue=${encodeURIComponent(
      loggedInUser?.userName
    )}&launch=${encodeURIComponent(loggedInUser?.launch || "default")}`;

    console.log("selected mood", selectedMood);
    sendEmail({
      reportLink,
      name: data.name,
      email: data.email,
      reportId: candidateId,
      mood: selectedMood,
    });
  };

  useEffect(() => {
    // Only open the modal once when component mounts
    setOpened(true);
  }, []); // Empty dependency array - only run once

  const onSelect = (value) => {
    console.log("Mood selected:", value);
    console.log("Current opened state before close:", opened);
    setSelectedMood(value);
    setOpened(false);
    console.log("Modal should be closed now");
    // Use setTimeout to log the state after it updates
    setTimeout(() => {
      console.log("Current opened state after close:", opened);
    }, 0);
  };

  const handleClose = () => {
    console.log("handleClose called");
    setOpened(false);
  };

  return (
    <Box>
      <MoodFeedback
        isOpen={opened}
        onClose={handleClose}
        onSelect={onSelect}
      />
      
      {/* Header Section */}
      <Stack gap={0} mb={{ base: 32, sm: 40 }}>
        <Group justify="space-between" align="flex-start" mb={{ base: 16, sm: 20 }}>
          <StepCountHeader step={3} totalSteps={3} />
        </Group>

        <Title
          order={1}
          size={{ base: "h2", sm: "h1" }}
          ta="center"
          c="var(--mantine-color-brand-5)"
          fw={700}
          lh={1.2}
          maw={600}
          mx="auto"
          px={{ base: 16, sm: 0 }}
          style={{ whiteSpace: "pre-line" }}
        >
          {t("result.congratulations")}
        </Title>

        <Text
          ta="center"
          size={{ base: "lg", sm: "xl" }}
          fw={500}
          c="var(--mantine-color-text-9)"
          mt={16}
          maw={600}
          mx="auto"
          px={{ base: 16, sm: 0 }}
          style={{ whiteSpace: "pre-line", lineHeight: 1.5 }}
        >
          {t("result.glow-festival-completion-message")}
        </Text>
      </Stack>

      {/* Form Section */}
      <Container size="sm" px={{ base: 16, sm: 0 }}>
        <Box
          p={{ base: "lg", sm: "xl" }}
          style={{
            backgroundColor: "var(--mantine-color-gray-0)",
            borderRadius: "16px",
            border: "1px solid var(--mantine-color-gray-2)",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={24}>
              <Stack gap={20}>
                <TextInput
                  label={t("general.name")}
                  placeholder="Enter your name"
                  size="xl"
                  required
                  error={errors.name?.message}
                  {...control.register("name")}
                  styles={{
                    label: {
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "var(--mantine-color-text-9)",
                      marginBottom: "8px",
                    },
                    input: {
                      fontSize: "16px",
                      fontWeight: 500,
                      border: "2px solid var(--mantine-color-gray-3)",
                      borderRadius: "12px",
                      height: "56px",
                      "&:focus": {
                        borderColor: "var(--mantine-color-brand-5)",
                        boxShadow: "0 0 0 3px rgba(229, 90, 43, 0.1)",
                      },
                      "&:hover": {
                        borderColor: "var(--mantine-color-gray-4)",
                      },
                    },
                  }}
                />
                
                <TextInput
                  label={t("general.email-address")}
                  placeholder="Enter your email"
                  size="xl"
                  type="email"
                  required
                  error={errors.email?.message}
                  {...control.register("email")}
                  styles={{
                    label: {
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "var(--mantine-color-text-9)",
                      marginBottom: "8px",
                    },
                    input: {
                      fontSize: "16px",
                      fontWeight: 500,
                      border: "2px solid var(--mantine-color-gray-3)",
                      borderRadius: "12px",
                      height: "56px",
                      "&:focus": {
                        borderColor: "var(--mantine-color-brand-5)",
                        boxShadow: "0 0 0 3px rgba(229, 90, 43, 0.1)",
                      },
                      "&:hover": {
                        borderColor: "var(--mantine-color-gray-4)",
                      },
                    },
                  }}
                />
              </Stack>

              <Stack gap={16}>
                <Button
                  type="submit"
                  variant="brand-filled"
                  size="xxl"
                  fullWidth
                  disabled={!watch("name") || !watch("email") || isPending}
                  loading={isPending}
                  styles={{
                    root: {
                      fontSize: "18px",
                      fontWeight: 700,
                      height: "60px",
                      borderRadius: "12px",
                      backgroundColor: "var(--mantine-color-brand-5)",
                      "&:hover": {
                        backgroundColor: "var(--mantine-color-brand-6)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(229, 90, 43, 0.3)",
                      },
                      "&:active": {
                        transform: "translateY(0)",
                      },
                    },
                  }}
                >
                  {t("result.lets-see-my-result")}
                </Button>
                
                <Button
                  variant="subtle"
                  color="gray"
                  size="lg"
                  fullWidth
                  onClick={() => setStep("report")}
                  styles={{
                    root: {
                      fontSize: "16px",
                      fontWeight: 600,
                      height: "48px",
                      borderRadius: "8px",
                      color: "var(--mantine-color-text-6)",
                      "&:hover": {
                        backgroundColor: "var(--mantine-color-gray-1)",
                        color: "var(--mantine-color-text-8)",
                      },
                    },
                  }}
                >
                  {t("result.ill-pass")}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Container>
    </Box>
  );
};
