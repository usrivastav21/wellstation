import {
  Box,
  Button,
  Container,
  Group,
  Image,
  Stack,
  Text,
  Title,
  rem,
} from "@mantine/core";
import { useSetAtom } from "jotai";
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BoothWithSmile, Coins } from "../assets";
import { stepAtom, reportIdAtom } from "../atoms";
import { isRoleLoggedIn } from "../api-client";
import { generateReportId } from "../utils/generateUserId";
import classes from "./Login.module.css";

export const WellbeingInfo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setStep = useSetAtom(stepAtom);
  const setReportId = useSetAtom(reportIdAtom);
  
  // Check if admin is logged in - use state to make it reactive
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check auth state when component mounts or when coming back to this page
    const checkAdminAuth = () => {
      const adminLoggedIn = isRoleLoggedIn("admin");
      setIsAdminLoggedIn(adminLoggedIn);
    };
    
    checkAdminAuth();
    
    // Optional: Listen to storage events to detect auth changes
    window.addEventListener('storage', checkAdminAuth);
    
    return () => {
      window.removeEventListener('storage', checkAdminAuth);
    };
  }, []);

  return (
    <Box>
      <Stack gap={0} mb={64}>
        <Title ta="center" fz="4xl" mb={48}>
          Your Daily Wellbeing Check-In!
        </Title>
        <Text fz="xl">
          Take a moment for yourself today — your mind and body will thank you.
          This wellbeing screening booth is here to support your health and
          performance, every single day.
        </Text>
      </Stack>

      <Stack align="center">
        {/* Centered booth information section */}
        <Group maw={724} wrap="nowrap" justify="center">
          <Image src={BoothWithSmile} w={"212px"} h={"304px"} />
          <Stack>
            <Text fz={"xl"}>What is this booth about?</Text>
            <Text fz="xl">
              You can use W3LL Station to check in on your physical and mental
              wellbeing. In just{" "}
              <Text fz="xl" fw={"bold"} c="#f53d67" component="span">
                60 seconds
              </Text>
              , you'll receive a personalised snapshot of how you're{" "}
              <Text fz={"xl"} fw={"bold"} c="#f53d67" component="span">
                feeling
              </Text>
              .
            </Text>
            <Text fz={"xl"}>You can share the result too!</Text>
          </Stack>
        </Group>

        {/* Removed rewards section - commented out for reference */}
        {/* <Stack maw={rem(968)}>
          <Title ta="center">Get Rewarded for Showing Up!</Title>

          <Stack
            pos={"relative"}
            bdrs={"xl"}
            bg={"#fae0c2"}
            px={64}
            h={294}
            className={classes.rewardContainer}
            gap={24}
          >
            <Text fz="xl" ta="center" lh={1.2} mt={54}>
              Every daily scan{" "}
              <Text component="span" lh={1.2} fz="xl" ff="PoetsonOne">
                earns you points
              </Text>
              — just for taking care of yourself.
            </Text>
            <Text lh={1.2} fz="xl" ta="center" fw={500}>
              Soon, you can redeem Lenovo rewards!
            </Text>

            <Box pos={"absolute"} bottom={0} left={0} right={0}>
              <Image w={"100%"} objectFit={"fill"} src={Coins} />
            </Box>
          </Stack>
        </Stack> */}

        <Container size={744} w={744}>
          <Stack gap={48} mt={64}>
            {/* OLD BEHAVIOR: Always show login/registration buttons */}
            {/* <Button
              component={Link}
              to={"/auth/login"}
              variant="brand-filled"
              size="xxl"
              fullWidth
            >
              Login
            </Button>
            <Group wrap="nowrap">
              <Button
                variant="white"
                onClick={() => {
                  navigate("/booth");
                  setStep("consentForm");
                }}
                fullWidth
                miw="fit-content"
                size="xxl"
                h="max-content"
                styles={{
                  label: {
                    whiteSpace: "normal",
                    flexDirection: "column",
                  },
                }}
              >
                Registration
                <br />
                <Text component="span" fz="2xl" c="inherit" lh={1.1}>
                  (for first time users)
                </Text>
              </Button>
              <Button
                variant="white"
                size="xxl"
                fullWidth
                fs={"italic"}
                onClick={() => {
                  setStep("consentForm");
                  navigate("/booth", {
                    state: {
                      isTrial: true,
                    },
                  });
                }}
              >
                Try me first!
              </Button>
            </Group> */}
            
            {/* NEW BEHAVIOR: Show "Proceed To Scan" button if admin is logged in */}
            {isAdminLoggedIn ? (
              <Button
                variant="brand-filled"
                size="xxl"
                bdrs="lg"
                bd={"4px solid var(--mantine-color-text-9)"}
                fullWidth
                onClick={() => {
                  // OLD: Admin went to dashboard
                  // setStep("dashboard");
                  
                  // NEW: Admin goes directly to facial analysis (scanning page)
                  // Generate reportId before starting the scan
                  setReportId(generateReportId());
                  setStep("facialAnalysis");
                  navigate("/booth");
                }}
              >
                {t("basicInfo.proceedToScan")}
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  to={"/admin-login"}
                  variant="brand-filled"
                  size="xxl"
                  fullWidth
                >
                  Login
                </Button>
                <Group wrap="nowrap">
                  <Button
                    variant="white"
                    onClick={() => {
                      navigate("/booth");
                      setStep("consentForm");
                    }}
                    fullWidth
                    miw="fit-content"
                    size="xxl"
                    h="max-content"
                    styles={{
                      label: {
                        whiteSpace: "normal",
                        flexDirection: "column",
                      },
                    }}
                  >
                    Registration
                    <br />
                    <Text component="span" fz="2xl" c="inherit" lh={1.1}>
                      (for first time users)
                    </Text>
                  </Button>
                  <Button
                    variant="white"
                    size="xxl"
                    fullWidth
                    fs={"italic"}
                    onClick={() => {
                      setStep("consentForm");
                      navigate("/booth", {
                        state: {
                          isTrial: true,
                        },
                      });
                    }}
                  >
                    Try me first!
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Container>
      </Stack>
    </Box>
  );
};

// OLD COMPONENT NAME: Login
// RENAMED TO: WellbeingInfo (more descriptive for wellbeing information page)

{
  /* <Header
isHeaderVisible={true}
handleClickExit={() => {
  setStep("welcome");
  navigate("/booth");
}}
/> */
}

{
  /* <Button
as={Link}
to={"/auth/login"}
variant="primary"
w={"100%"}
size="xl"
fontWeight={"bold"}
boxShadow={
  "8px 12px 20px 0px var(--chakra-colors-shadow-100), var(--chakra-shadows-primary-border-shadow-md)"
}
>
Login
</Button>
*/
}

