import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSetAtom } from "jotai";
import { stepAtom } from "../atoms";
import {
  Center,
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

  // Timer effect for auto-close
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Separate effect to handle navigation when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0) {
      setStep("welcome");
      navigate("/booth");
    }
  }, [timeLeft, setStep, navigate]);

  const handleExit = () => {
    setStep("welcome");
    navigate("/booth");
  };

  return (
    <Box h="100vh" bg="white" style={{ position: "relative" }}>
      {/* Top Right Exit Button */}
      

      <Container size="xl" h="100%" py="md">
        <Flex direction="column" align="center" justify="flex-start" h="100%" gap="xl" pt="xl">
          {/* Header */}
          

          {/* Main Content */}
          <Flex align="flex-start" gap="xl" wrap="nowrap" maw={1200}>
            {/* Left Side - W3LL Companion Logo */}
            <Box>
            <Image 
              src={W3LLCompanionLogo} 
              h={120} 
              w="auto" 
              alt="W3LL Companion" 
            />
            </Box>

            {/* Right Side - Description */}
            <Stack gap="md" maw={500} mt="md">
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
              h={60} 
              w="auto" 
              alt="Get it on Google Play"
              style={{ cursor: "pointer" }}
            />
            <Image 
              src={AppStoreBadge} 
              h={60} 
              w="auto" 
              alt="Download on the App Store"
              style={{ cursor: "pointer" }}
            />
          </Group>

          {/* QR Codes */}
          <Group gap="xl" justify="center">
            <Image 
              src={QRCodeIOS} 
              h={120} 
              w={120} 
              alt="QR Code iOS"
            />
            <Image 
              src={QRCodeAndroid} 
              h={120} 
              w={120} 
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