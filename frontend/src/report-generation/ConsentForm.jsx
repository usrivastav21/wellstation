import {
  Box,
  Button,
  Container,
  Flex,
  Stack,
  Text,
  Title,
  rem,
} from "@mantine/core";
import { useSetAtom } from "jotai";
import { Trans, useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { isRoleLoggedIn } from "../api-client/auth";
import { stepAtom, trialIdAtom } from "../atoms";
import { useTrialStart } from "./trial";

const ConsentForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setStep = useSetAtom(stepAtom);
  const setTrialId = useSetAtom(trialIdAtom);

  const location = useLocation();
  const trialStart = useTrialStart({
    onSuccess: (data) => {
      setTrialId(data.data.trial_id);
      setStep("facialAnalysis");
      navigate("/booth", {
        state: {
          isTrial: !!location.state?.isTrial,
        },
      });
    },
  });

  const renderList = () => {
    try {
      const list = t("consentScreen.list", { returnObjects: true });
      if (!Array.isArray(list)) {
        console.warn("List is not an array:", list);
        return null;
      }

      return list.map((item, index) => (
        <Flex key={index} align="flex-start" mb={rem(10)}>
          <Text fz="xl">
            • <strong>{item?.title || ""}</strong> {item?.description || ""}
          </Text>
        </Flex>
      ));
    } catch (error) {
      console.error("Error rendering list:", error);
      return null;
    }
  };

  return (
    <Box h={"100%"}>
      <Stack gap={48}>
        <Stack>
          <Title ta="center" fz="4xl" fw="900">
            {t("consentScreen.mainHeader")}
          </Title>
          <Trans
            i18nKey="consentScreen.mainDescription"
            components={{
              highlight: (
                <Text
                  fz={"xl"}
                  component="span"
                  c="var(--mantine-color-error)"
                />
              ),
              text: <Text fz={"xl"} />,
            }}
          />
        </Stack>

        <Stack>
          <Title ta="center" fz="3xl" fw="bold">
            {t("consentScreen.header1")}
          </Title>
          <Text fz="xl">{t("consentScreen.description1")}</Text>
          <Box>{renderList()}</Box>
        </Stack>
      </Stack>

      <Container size={rem(656)} p={0}>
        <Button
          variant="brand-filled"
          bdrs={"lg"}
          miw={rem(656)}
          size="xxl"
          mt={rem(48)}
          onClick={async () => {
            if (location.state?.isTrial) {
              await trialStart.mutateAsync();
              // setReportId(generateReportId());

              return;
            }

            // OLD BEHAVIOR: Only checked for user role
            // if (isRoleLoggedIn("user")) {
            //   setStep("dashboard");
            // } else {
            //   navigate("/registration");
            // }
            
            // NEW BEHAVIOR: Allow both user and admin to proceed to dashboard
            if (isRoleLoggedIn("user") || isRoleLoggedIn("admin")) {
              setStep("dashboard");
            } else {
              navigate("/registration");
            }
          }}
        >
          {t("general.next")}
        </Button>
      </Container>
    </Box>
  );
};

export default ConsentForm;
