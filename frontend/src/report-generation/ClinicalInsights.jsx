import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useSetAtom } from "jotai";
import { stepAtom } from "../atoms";
import { getCurrentRoleData } from "../api-client";
import {
  Stack,
  Text,
  Button,
  Group,
  Image,
  Box,
  Flex,
  Container,
} from "@mantine/core";
import { ExitWithoutArrowIcon } from "../assets/icons";

// Import assets - using public directory paths (accessible in all environments)
const W3LLCompanionLogo = "/images/W3LL-Companion.svg";
const GooglePlayBadge = "/images/Google-Play-Badge.svg";
const AppStoreBadge = "/images/App-Store-Badge.svg";
const QRCodeIOS = "/images/QR-Code-iOS.svg";
const QRCodeAndroid = "/images/QR-Code-Android.svg";

export const ClinicalInsights = () => {
  const navigate = useNavigate();
  const setStep = useSetAtom(stepAtom);
  const [timeLeft, setTimeLeft] = useState(30);
  const hasNavigated = useRef(false);

  // Check if admin is logged in
  const loggedInUser = getCurrentRoleData("admin");

  // Timer effect for auto-close
  useEffect(() => {
    // Skip timer for admin/SCAPE users - they should have manual control
    if (loggedInUser) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Use setTimeout to defer navigation to avoid render cycle issues
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            setTimeout(() => {
              setStep("welcome");
              navigate("/booth");
            }, 0);
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setStep, navigate, loggedInUser]);

  const handleExit = () => {
    setStep("welcome");
    navigate("/booth");
  };

  return (
    <Box h="100vh" bg="white" style={{ position: "relative" }}>
      <Container size="xl" h="100%" py="sm">
        <Flex direction="column" align="center" justify="flex-start" h="100%" gap="lg" pt="md">
          {/* Header */}


          {/* Main Content */}
          <Flex align="flex-start" gap="xl" wrap="nowrap" maw={1400}>
            {/* Left Side - W3LL Companion Logo */}
            <Box>
              <Image
                src={W3LLCompanionLogo}
                h={100}
                w="auto"
                alt="W3LL Companion"
              />
            </Box>

            {/* Right Side - Description */}
            <Stack gap="sm" maw={600} mt="md">
              <Text fw="bold" fz="xl" c="black" style={{ whiteSpace: 'nowrap' }}>
                Your Intelligent Wellbeing Companion.
              </Text>
              <Text fz="md" c="black">
                Uncover patterns in your behaviours and receive
              </Text>
              <Text fz="md" c="black">
                clinical insights to manage your moods.
              </Text>
            </Stack>
          </Flex>

          {/* App Download Buttons */}
          <Group gap="md" justify="center">
            <Image
              src={GooglePlayBadge}
              h={50}
              w="auto"
              alt="Get it on Google Play"
              style={{ cursor: "pointer" }}
            />
            <Image
              src={AppStoreBadge}
              h={50}
              w="auto"
              alt="Download on the App Store"
              style={{ cursor: "pointer" }}
            />
          </Group>

          {/* QR Codes */}
          <Group gap="lg" justify="center">
            <Image
              src={QRCodeIOS}
              h={100}
              w={100}
              alt="QR Code iOS"
            />
            <Image
              src={QRCodeAndroid}
              h={100}
              w={100}
              alt="QR Code Android"
            />
          </Group>

          {/* Countdown Message - Only show for regular users, not for admin/SCAPE users */}
          {!loggedInUser && (
            <Text fz="md" c="black" ta="center">
              This page will automatically close in {timeLeft} seconds.
            </Text>
          )}

          {/* Bottom Exit Button */}
          <Button
            variant="filled"
            color="#E55A2B"
            size="lg"
            onClick={handleExit}
            leftSection={<img src={ExitWithoutArrowIcon} alt="Exit" width={24} height={24} />}
            styles={{
              root: {
                backgroundColor: "#E55A2B",
                color: "black",
                borderRadius: "8px",
                padding: "12px 32px",
                boxShadow: "0 4px 12px rgba(229, 90, 43, 0.3)",
                border: "none",
                fontWeight: "bold",
                fontSize: "30px",
                "&:hover": {
                  backgroundColor: "#D1451A",
                  color: "black",
                  boxShadow: "0 6px 16px rgba(229, 90, 43, 0.4)",
                  transform: "translateY(-1px)"
                },
                "&:active": {
                  transform: "translateY(0px)",
                  boxShadow: "0 2px 8px rgba(229, 90, 43, 0.3)"
                }
              },
              label: {
                color: "black !important",
                fontWeight: "bold"
              }
            }}
          >
            Exit
          </Button>
        </Flex>
      </Container>
    </Box>
  );
};