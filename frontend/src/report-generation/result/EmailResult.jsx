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
      
      <Stack gap={0} mb={32}>
        <Group justify="space-between" align="flex-start" mb={16}>
          <StepCountHeader step={3} totalSteps={3} />
          <Title
            order={1}
            size="h1"
            ta="center"
            c="var(--mantine-color-brand-5)"
            fw={700}
            lh={1.1}
            maw={500}
            mx="auto"
            style={{ whiteSpace: "pre-line" }}
          >
            {t("result.congratulations")}
          </Title>
        </Group>

        <Text
          ta="center"
          size="lg"
          fw={500}
          c="var(--mantine-color-text-9)"
          mb={24}
          maw={500}
          mx="auto"
          style={{ whiteSpace: "pre-line", lineHeight: 1.4 }}
        >
          {t("result.glow-festival-completion-message")}
        </Text>
      </Stack>

      <Container size="sm" px={0}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={16}>
            <Stack gap={12}>
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
                    borderRadius: "8px",
                    "&:focus": {
                      borderColor: "var(--mantine-color-brand-5)",
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
                    borderRadius: "8px",
                    "&:focus": {
                      borderColor: "var(--mantine-color-brand-5)",
                    },
                  },
                }}
              />
            </Stack>

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
                  height: "56px",
                  borderRadius: "12px",
                },
              }}
            >
              {t("result.lets-see-my-result")}
            </Button>
            
            <Button
              variant="subtle"
              color="orange"
              size="lg"
              fullWidth
              onClick={() => setStep("report")}
              styles={{
                root: {
                  fontSize: "16px",
                  fontWeight: 600,
                  height: "48px",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "var(--mantine-color-orange-0)",
                  },
                },
              }}
            >
              {t("result.ill-pass")}
            </Button>
          </Stack>
        </form>
      </Container>
    </Box>
  );
};
