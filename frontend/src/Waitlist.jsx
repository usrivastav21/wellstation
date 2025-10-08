import { Button, Group, Image, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useSetAtom } from "jotai";

import { stepAtom } from "./atoms";
import { CompanionLogo, GirlHoldingPhone } from "./assets";
import WaitlistQRCode from "./assets/waitlist_qr_code.svg";
import { useCountdown } from "./utils";

export const Waitlist = () => {
  const navigate = useNavigate();
  const setStep = useSetAtom(stepAtom);
  const { timeLeft } = useCountdown(30, {
    autoStart: true,
    onComplete: () => {
      navigate("/booth");
      setStep("dashboard");
    },
  });

  const { t } = useTranslation();

  return (
    <Stack gap={48} align="center" pt={24}>
      <Group gap={32}>
        <Image src={CompanionLogo} alt="Companion Logo" w={178} h={124} />
        <Stack gap={16} maw={456} wrap="nowrap">
          <Text fz="lg" fw="bold">
            Your Intelligent Wellbeing Companion
          </Text>
          <Text fz={20}>
            Uncover patterns in your behaviours and receive clinical insights to
            manage your moods.
          </Text>
        </Stack>
      </Group>

      <Group bdrs={40} bg="black" p={16} maw={420} wrap="nowrap">
        <Image
          src={GirlHoldingPhone}
          alt="Girl Holding Phone"
          w={184}
          h={184}
        />
        <Stack gap={16} align="center">
          <Text fz="md" fw="bold" c="white" ta="center">
            Join the waitlist today for free access!
          </Text>
          <Image src={WaitlistQRCode} alt="Waitlist QR Code" w={116} h={116} />
        </Stack>
      </Group>

      <Stack gap={12} align="center">
        <Text fz={20}>
          {t("report.auto-close-message", { count: timeLeft })}
        </Text>
        <Button
          variant="brand-filled"
          w="fit-content"
          size="xl"
          bd="4px solid var(--mantine-color-text-9)"
          bdrs="lg"
          onClick={() => {
            navigate("/booth");
            setStep("dashboard");
          }}
        >
          {t("general.exit")}
        </Button>
      </Stack>
    </Stack>
  );
};
