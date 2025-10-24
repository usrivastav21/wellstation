import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useSetAtom } from "jotai";
import { stepAtom } from "../atoms";
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

// Import assets - using public directory paths
const W3LLCompanionLogo = "/assets/W3LL-Companion.svg";
const GooglePlayBadge = "/assets/Google-Play-Badge.svg";
const AppStoreBadge = "/assets/App-Store-Badge.svg";
const QRCodeIOS = "/assets/QR-Code-iOS.svg";
const QRCodeAndroid = "/assets/QR-Code-Android.svg";

export const ClinicalInsights = () => {
  const navigate = useNavigate();
  const setStep = useSetAtom(stepAtom);
  const [timeLeft, setTimeLeft] = useState(30);
  const hasNavigated = useRef(false);

  // Timer effect for auto-close
  useEffect(() => {
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
  }, [setStep, navigate]);

  const handleExit = () => {
    setStep("welcome");
    navigate("/booth");
  };

  return (
    <Box h="100vh" bg="white" style={{ position: "relative" }}>
      {/* Top Right Exit Button */}
      <Button
        variant="subtle"
        color="gray"
        size="sm"
        onClick={handleExit}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
        }}
        leftSection={<img src={ExitWithoutArrowIcon} alt="Exit" width={16} height={16} />}
      >
        Exit
      </Button>

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

          {/* Countdown Message */}
          <Text fz="md" c="black" ta="center">
            This page will automatically close in {timeLeft} seconds.
          </Text>

          {/* Bottom Exit Button */}
          <Button
            variant="filled"
            color="#E55A2B"
            size="lg"
            onClick={handleExit}
            leftSection={<img src={ExitWithoutArrowIcon} alt="Exit" width={16} height={16} />}
            styles={{
              root: {
                backgroundColor: "#E55A2B",
                color: "black",
                "&:hover": { 
                  backgroundColor: "#D1451A",
                  color: "black"
                }
              },
              label: {
                color: "black !important"
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