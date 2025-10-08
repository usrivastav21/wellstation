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
import { BoothWithSmile, Coins } from "../assets";
import { stepAtom } from "../atoms";
import classes from "./Login.module.css";

export const Login = () => {
  const navigate = useNavigate();
  const setStep = useSetAtom(stepAtom);

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

      <Stack>
        <Group gap={48} wrap="nowrap">
          <Group maw={724} wrap="nowrap">
            <Image src={BoothWithSmile} w={"212px"} h={"304px"} />
            <Stack>
              <Text fz={"xl"}>What is this booth about?</Text>
              <Text fz="xl">
                You can use W3LL Station to check in on your physical and mental
                wellbeing. In just{" "}
                <Text fz="xl" fw={"bold"} c="#f53d67" component="span">
                  60 seconds
                </Text>
                , you’ll receive a personalised snapshot of how you’re{" "}
                <Text fz={"xl"} fw={"bold"} c="#f53d67" component="span">
                  feeling
                </Text>
                .
              </Text>
              <Text fz={"xl"}>You can share the result too!</Text>
            </Stack>
          </Group>

          <Stack maw={rem(968)}>
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
          </Stack>
        </Group>

        <Container size={744} w={744}>
          <Stack gap={48} mt={64}>
            <Button
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
            </Group>
          </Stack>
        </Container>
      </Stack>
    </Box>
  );
};
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
