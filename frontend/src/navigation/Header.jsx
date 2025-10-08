import {
  Button,
  Group,
  Image,
  Space,
  Text,
  Stack,
  Center,
} from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { forwardRef } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router";

import { getCurrentRoleData, isRoleLoggedIn, logoutUser } from "../api-client";
import { stepAtom } from "../atoms";

import ExitIcon from "../assets/header_exit_icon.svg";
import { HandHeartIcon, ProfileIcon } from "../assets/icons";
import wellStationLogo from "../assets/well_station_logo.png";
import classes from "./Header.module.css";
import { useQueryClient } from "@tanstack/react-query";

const LogoutButton = () => {
  const queryClient = useQueryClient();
  const isUserLoggedIn = isRoleLoggedIn("user");
  const navigate = useNavigate();
  const setStep = useSetAtom(stepAtom);

  return isUserLoggedIn ? (
    <Button
      variant="white"
      size="xl"
      onClick={() => {
        queryClient.removeQueries();
        logoutUser();
        setStep("welcome");
        navigate("/booth");
      }}
      classNames={{ root: classes.root, label: classes.label }}
    >
      <Image src={ExitIcon} w={64} h={64} />
      Logout
    </Button>
  ) : (
    <Button
      variant="white"
      size="xl"
      classNames={{ root: classes.root, label: classes.label }}
      onClick={() => {
        setStep("welcome");
        navigate("/booth");
      }}
    >
      <Image src={ExitIcon} w={54} h={54} />
      Exit
    </Button>
  );
};

const ResourcesButton = () => {
  const isUserLoggedIn = isRoleLoggedIn("user");
  const navigate = useNavigate();
  if (!isUserLoggedIn) {
    return null;
  }

  return (
    <Button
      variant="white"
      size="xl"
      onClick={() => {
        navigate("/resources");
      }}
      classNames={{ root: classes.root, label: classes.label }}
    >
      <Image src={HandHeartIcon} w={64} h={64} />
      Resources
    </Button>
  );
};

export const Header = forwardRef((props, ref) => {
  const isUserLoggedIn = isRoleLoggedIn("user");
  const setStep = useSetAtom(stepAtom);
  const currentStep = useAtomValue(stepAtom);
  const currentRoleData = getCurrentRoleData("user");
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenOnRoutes = [
    {
      step: "welcome",
      route: "/booth",
    },
    {
      step: null,
      route: "/admin",
    },
  ];

  const shouldHideHeader = hiddenOnRoutes.some((routeItem) => {
    if (location.pathname === "/booth") {
      return (
        routeItem.route === location.pathname && routeItem.step === currentStep
      );
    }

    return routeItem.route === location.pathname;
  });

  if (shouldHideHeader) {
    return null;
  }

  if (location.pathname === "/resources") {
    return (
      <Group h={144} justify="space-between">
        <Button
          leftSection={<FaChevronLeft />}
          variant="white"
          size="xl"
          onClick={() => {
            navigate("/booth");
            setStep("dashboard");
          }}
        >
          Back
        </Button>
        <Button
          leftSection={<FaChevronLeft />}
          onClick={() => {
            navigate("/booth");
            setStep("dashboard");
          }}
          variant="white"
          size="xl"
        >
          Dashboard
        </Button>
        <LogoutButton />
      </Group>
    );
  }

  return (
    <Group h={144}>
      {isUserLoggedIn ? (
        <Stack gap={6} flex={0.1}>
          <Group gap={12}>
            <Image w={54} h={54} src={ProfileIcon} alt="Profile" />
            <Text fz={"3xl"} fw="bold">
              Hello!
            </Text>
          </Group>
          <Text fz="lg" lh={1.2}>
            {currentRoleData?.email}
          </Text>
        </Stack>
      ) : location.pathname === "/registration" ||
        location.pathname === "/auth/login" ? (
        <Button
          leftSection={<FaChevronLeft />}
          variant="white"
          size="xl"
          onClick={() => {
            navigate("/auth");
          }}
        >
          Back
        </Button>
      ) : (
        <Space w={1} flex={0.1} />
      )}

      <Center flex={0.8}>
        <Image w={312} h={64} src={wellStationLogo} alt="Well Station" />
      </Center>

      <Group flex={0.1} gap={32} wrap="nowrap">
        {/* <ResourcesButton /> */}
        <LogoutButton />
      </Group>
    </Group>
  );

  // return (
  //   <Flex
  //     ref={ref}
  //     width={paddedWidth}
  //     marginY={0}
  //     bg="#fff"
  //     height={topBarHeight}
  //     zIndex={1}
  //     py={8}
  //     justifyContent={"space-between"}
  //     alignItems={"center"}
  //     px={isInsideBooth ? 18.5 : 0}
  //   >
  //     {isUserLoggedIn ? (
  //       <Flex flex={1} columnGap={3}>
  //         <Image width={14} height={14} src={ProfileIcon} alt="Profile" />
  //         <Text fontSize={"40px"} fontWeight="bold">
  //           Hello!
  //         </Text>
  //       </Flex>
  //     ) : (
  //       <Flex flex={1} height="100%" />
  //     )}
  //     <Flex
  //       height="100%"
  //       align="center"
  //       justify="center"
  //       sx={{ marginTop: "0px", marginBottom: "0px" }}
  //     >
  //       <Image
  //         src={wellStationLogo}
  //         marginTop="20px"
  //         height={{ base: SIZES[36], lg: SIZES[80] }}
  //         // width="220px"
  //         objectFit="contain"
  //         alt="Well Station"
  //       />
  //     </Flex>
  //     <Flex direction="column" flex={1} align="flex-end" justify="center">
  //       {isExitButtonVisible && (
  //         <Box onClick={handleClickExit} textAlign="center" cursor="pointer">
  //           <Image
  //             width={{
  //               base: "3vh",
  //               sm: "30px",
  //               md: "30px",
  //               lg: "24px",
  //               xl: "22px",
  //             }}
  //             height={{
  //               base: "3vh",
  //               sm: "30px",
  //               md: "33px",
  //               lg: "24px",
  //               xl: "24px",
  //             }}
  //             src={ExitIcon}
  //             margin="0 auto"
  //             objectFit="contain"
  //             alt="Exit"
  //           />
  //           <Text fontFamily="Lato" fontSize={exitFontSize} fontWeight="bold">
  //             {isUserLoggedIn ? "Logout" : t("exit")}
  //           </Text>
  //         </Box>
  //       )}
  //     </Flex>
  //   </Flex>
  // );
});

Header.displayName = "Header";
