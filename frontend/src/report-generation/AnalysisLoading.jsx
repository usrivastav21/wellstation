import { useBreakpointValue } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Center, Modal, Stack, Text, Title } from "@mantine/core";

import { stepAtom, trialIdAtom } from "../atoms";
import { UPDATED_TAB_SIZES } from "../atoms/sd";
import LoadingSpinnerAnimation from "../components/LoadingSpinnerAnimation";
import StepCountHeader from "../components/StepCountHeader";
import CustomProgressBar from "../components/progressBar/ProgressBar";

import classes from "./AnalysisLoading.module.css";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router";

const SignupModal = ({ opened, onClose }) => {
  const navigate = useNavigate();
  const setStep = useSetAtom(stepAtom);
  return (
    <Modal
      opened={opened}
      size="lg"
      onClose={onClose}
      closeButtonProps={{
        size: "lg",
      }}
      styles={{
        content: {
          border: "4px solid var(--mantine-color-brandDark-6)",
          borderRadius: "var(--mantine-radius-lg)",
        },
      }}
    >
      <Stack gap={48}>
        <Stack gap={24}>
          <Title fz="4xl" fw="bold" ta="center">
            Sign up now to view your results
          </Title>
          <Text fz="3xl" ta="center">
            You will also be part of the Wellbeing reward programme to earn
            yourself a reward!
          </Text>
        </Stack>

        <Stack gap={48} align="center">
          <Button
            size="xl"
            w="fit-content"
            bdrs="lg"
            bd={"2px solid var(--mantine-color-text-9)"}
            variant="brand-filled"
            onClick={() => {
              navigate("/registration", {
                state: {
                  isTrial: true,
                },
              });
            }}
          >
            Sign Up
          </Button>
          <Button
            size="xl"
            variant="white"
            onClick={() => {
              setStep("welcome");
              navigate("/booth");
            }}
          >
            I&apos;m not interested
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};

export const AnalysisLoading = () => {
  const { t } = useTranslation();
  const setStep = useSetAtom(stepAtom);
  const SIZES = UPDATED_TAB_SIZES;
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const trialId = useAtomValue(trialIdAtom);

  const [
    isSignupModalOpen,
    { open: openSignupModal, close: closeSignupModal },
  ] = useDisclosure(false);

  const breakpointValues = {
    fontSizes: {
      mainMessage: {
        base: "18px",
        sm: "32px",
        md: "2.5rem",
        lg: "2.5rem",
        xl: SIZES[24],
      },
    },
    spinnerSize: {
      base: "40px",
      sm: "40px",
      md: "40px",
      lg: "40px",
      xl: SIZES[58],
    },
    progressBarBottomMargin: {
      base: "50px",
      sm: "100px",
      md: "100px",
      lg: "50px",
      xl: SIZES[50],
    },
  };

  const textFontSize = useBreakpointValue(
    breakpointValues.fontSizes.mainMessage
  );

  const spinnerSize = useBreakpointValue(breakpointValues.spinnerSize);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            if (trialId) {
              openSignupModal();
              return;
            }
            await queryClient.invalidateQueries({ queryKey: ["rewards"] });
            await queryClient.invalidateQueries({ queryKey: ["reports"] });
            setStep("emailResult");
          }, 1000);
        }
        return Math.min(newProgress, 100);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [setStep]);

  return (
    <Box pos="relative" h="100%">
      <SignupModal opened={isSignupModalOpen} onClose={closeSignupModal} />

      <Box pos={"absolute"} left={0}>
        <StepCountHeader step={2} totalSteps={3} />
      </Box>

      <Center h="100%">
        <Stack gap={48}>
          <Text fz="4xl" fw="bolder" ta="center" className={classes.title}>
            {t("analysisLoading.mainMessage")}
          </Text>

          <Stack gap={24} align="center">
            <Text fz="4xl" fw="bolder">
              {t("analysisLoading.waitMessage")}
            </Text>
            <LoadingSpinnerAnimation size={spinnerSize} color="#F5703D" />
          </Stack>

          <Center w={654} mx="auto" ta="center">
            <CustomProgressBar
              progress={progress}
              textKeyWord={t("analysisLoading.screeningText")}
              textFontSize={textFontSize}
            />
          </Center>
        </Stack>
      </Center>
    </Box>
  );
};
