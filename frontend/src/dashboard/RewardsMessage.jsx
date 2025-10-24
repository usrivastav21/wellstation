import { Modal, Image, Text, Button, Stack } from "@mantine/core";
import { useAtomValue } from "jotai";

import { CoinIcon } from "../assets";
import { useRewards } from "./useRewards";
import { getCurrentRoleData } from "../api-client";
import classes from "./RewardsMessage.module.css";
import { reportIdAtom, trialIdAtom } from "../atoms";

export const RewardsMessage = ({ onDismiss, onClose, opened }) => {
  // OLD BEHAVIOR: Only get user role data
  // const user = getCurrentRoleData("user");
  
  // NEW BEHAVIOR: Get data from either user or admin role
  const user = getCurrentRoleData("user") || getCurrentRoleData("admin");
  const email = user?.email ?? "";
  const reportId = useAtomValue(reportIdAtom);
  const trialId = useAtomValue(trialIdAtom);

  const rewards = useRewards({ email, reportId: reportId || trialId });

  return (
    <Modal
      withCloseButton={false}
      opened={opened && !!rewards.data?.shouldShowRewards}
      onClose={onClose}
      size="lg"
      classNames={{
        content: classes.content,
      }}
    >
      <Stack gap={48} align="center">
        <Image src={CoinIcon} w={128} h={128} />
        <Text fz="4xl" fw="bold" ta="center" lh={1.2}>
          {rewards.data?.totalRewardPoints === 1
            ? "You have earned 1 point for today scan!"
            : rewards.data?.totalRewardPoints > 1
            ? "You have earned 1 point for today's scan. Get 2 points for completing a 5-day streak!"
            : "An error occurred while fetching rewards"}
        </Text>
        <Button
          variant="brand-filled"
          size="xl"
          bdrs="lg"
          bd={"2px solid var(--mantine-color-text-9)"}
          onClick={() => {
            onDismiss();
          }}
        >
          Dismiss
        </Button>
      </Stack>
    </Modal>
  );
};
