import { Box, HStack, VStack } from "@chakra-ui/react";
import { Center, Stack, Text, Button, Group, Modal, Box as MantineBox } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { stepAtom, reportIdAtom, trialIdAtom } from "../../atoms";
import { MetricBar } from "./MetricBar";
import { metrics } from "./report-config";
import {
  findRestingHeartRateIndicatorValue,
  getColorV2,
  getUpdatedHeartRateText,
} from "./report-utils";
import { useReport, useTrialReport } from "./queries";
import { GenerateQrCode } from "../GenerateQrCode";
import { getCurrentRoleData } from "../../api-client";
import { useSendEmail } from "./useSendEmail";
import { useReportUrl } from "../useReportUrl";
import { useNavigate } from "react-router";
import useRecommendations from "../../resources/useRecommendations";
import { VideoPlayer } from "../../resources/VideoPlayer";

const TIME_LEFT = 30; // time left in seconds

const getIndicatorValue = ({ gender, ageRange, metric, value }) => {
  switch (metric) {
    case "bloodPressure": {
      if (value && value.includes("/")) {
        const [systolic, diastolic] = value.split("/");
        if (systolic < 131 && diastolic < 86) return 20;
        if (
          (systolic > 130 || systolic < 140) &&
          (diastolic > 84 || diastolic < 140)
        )
          return 50;
        if (systolic > 140 && diastolic > 90) return 20;
      }
      break;
    }

    case "bloodOxygenLevel": {
      return 100 - value;
    }

    case "restingHeartRate": {
      let val = findRestingHeartRateIndicatorValue({
        restingHeartRate: value,
        gender,
        ageRange,
      });
      // console.log("<= restingHeartRate val", val);
      if (val == "poor") return 95;
      if (val == "good") return 5;
      return 50;

      // return 100 - value;
    }

    case "stressLevel":
    case "depressionLevel":
    case "anxietyLevel": {
      if (value == "low") return 5;
      if (value == "high") return 95;
      return 50;
    }

    default: {
      return 100;
    }
  }
};

export const Report = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // OLD BEHAVIOR: Only get user role data
  // const user = getCurrentRoleData("user");
  
  // NEW BEHAVIOR: Get data from either user or admin role
  const user = getCurrentRoleData("user") || getCurrentRoleData("admin");

  const reportId = useAtomValue(reportIdAtom);
  const trialId = useAtomValue(trialIdAtom);
  const [infoText, setInfoText] = useState(null);
  const [isInfoPopUpOpen, setIsInfoPopUpOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LEFT);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setStep = useSetAtom(stepAtom);

  const emailSentRef = useRef(false);

  const report = useReport(reportId);
  const trialReport = useTrialReport(trialId);
  const { mutate: sendEmail, isPending } = useSendEmail();
  const reportLink = useReportUrl(reportId || trialId);
  const recommendations = useRecommendations(reportId || trialId);

  console.log("trialReport", trialReport);

  useEffect(() => {
    if (
      user &&
      (reportId || trialId) &&
      (report.isSuccess || trialReport.isSuccess) &&
      !emailSentRef.current
    ) {
      emailSentRef.current = true;

      sendEmail({
        reportLink,
        name: user?.userName,
        email: user?.email,
        reportId: reportId || trialId,
      });
    }
  }, [
    user,
    reportId,
    trialId,
    report.isSuccess,
    trialReport.isSuccess,
    sendEmail,
  ]);

  // Timer effect for auto-close
  useEffect(() => {
    // Skip timer for admin/SCAPE users - they should have manual control
    if (getCurrentRoleData("admin")) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up - show popup
          setIsModalOpen(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (report.isLoading || trialReport.isLoading) {
    return <div>Loading...</div>;
  }

  if (report.isError || trialReport.isError) {
    return <div>Error</div>;
  }

  const data = trialId ? trialReport.data : report.data;
  
  // Add null check for data to prevent destructuring errors
  if (!data) {
    return <div>No data available</div>;
  }
  
  const {
    ageRange = null,
    gender = null,
    vitalSigns = null,
    mentalHealthScores = null,
  } = data || {};
  
  // Fallback: if mentalHealthScores is not available, try to get it from the original data structure
  const fallbackMentalHealthScores = mentalHealthScores || data?.mental_health_scores;

  console.log("data", trialId ? trialReport.data : report.data);
  console.log("mentalHealthScores", mentalHealthScores);
  console.log("fallbackMentalHealthScores", fallbackMentalHealthScores);
  console.log("vitalSigns", vitalSigns);
  let patientData = {
    name: "Patient",
    age: "N/A",
    gender: "N/A",
    bloodPressure: vitalSigns
      ? `${vitalSigns.blood_pressure_systolic}/${vitalSigns.blood_pressure_diastolic}`
      : "NA",
    stressLevel: fallbackMentalHealthScores ? `${fallbackMentalHealthScores.stress}` : "NA",
    restingHeartRate: vitalSigns ? `${vitalSigns.heart_rate}` : "70",
    anxietyLevel: fallbackMentalHealthScores ? `${fallbackMentalHealthScores.anxiety}` : "NA",
    bloodOxygenLevel: vitalSigns ? `${vitalSigns.spo2}` : "95",
    depressionLevel: fallbackMentalHealthScores
      ? `${fallbackMentalHealthScores.depression}`
      : "NA",
  };

  const LEVELS = ["low", "medium", "high"];

  const getDisplayValue = (metric, value) => {
    // Handle undefined or NA values
    if (value === undefined || value === "NA" || value === "undefined") {
      return "NA";
    }

    // For numeric metrics, return the value as is
    if (metric.isNumeric) return value;

    if (LEVELS.includes(value)) {
      return value.toLowerCase();
    }

    // For non-numeric values (stress, anxiety, depression)
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue)) {
      if (numericValue >= 68) {
        return t("report.legends.poor");
      }
      if (numericValue >= 34) {
        return t("report.legends.mid");
      }
      return t("report.legends.good");
    }

    return value;
  };

  const handleOpenInfoPopUp = (metric) => {
    // console.log("<= metric", metric);
    setSelectedMetric(metric);
    // Convert translation string to array format expected by PopDisplayComponent
    let infoText = t(`report.infoText.${metric.accessor}`, {
      returnObjects: true,
    });

    // Ensure infoText is an array
    if (!Array.isArray(infoText)) {
      infoText = [infoText];
    }

    if (metric.name === "restingHeartRate") {
      const heartRateUpdatedText = getUpdatedHeartRateText(t, ageRange || null, gender || null);

      // Ensure heartRateUpdatedText is an array
      const updatedTextArray = Array.isArray(heartRateUpdatedText)
        ? heartRateUpdatedText
        : [heartRateUpdatedText];

      // Combine arrays safely
      infoText = [
        ...infoText.slice(0, 4),
        ...updatedTextArray,
        ...infoText.slice(8, 10),
      ];
    }

    // console.log("<= after update", infoText);

    setInfoText(infoText);
    setIsInfoPopUpOpen(true);
  };

  const handleCloseInfoPopUp = () => {
    setInfoText(null);
    setIsInfoPopUpOpen(false);
  };

  // Function to calculate total score and determine video level
  const getOverallHealthLevel = () => {
    const stressScore = getStressScore(patientData.stressLevel);
    const anxietyScore = getAnxietyScore(patientData.anxietyLevel);
    const depressionScore = getDepressionScore(patientData.depressionLevel)
    
    const totalScore = stressScore + anxietyScore + depressionScore;
    
    console.log("Individual Scores:", { 
      stress: patientData.stressLevel ,
      stressScore,
      anxiety: patientData.anxietyLevel, 
      anxietyScore,
      depression: patientData.depressionLevel, 
      depressionScore,
      totalScore 
    });
    
    // Based on the scoring system from the image:
    // Total Score 5-8 → Green (Low video)
    // Total Score 9-11 → Yellow (Moderate video) 
    // Total Score 12+ → Red (High video)
    if (totalScore >= 12) {
      return "high";
    } else if (totalScore >= 9) {
      return "moderate";
    } else {
      return "low";
    }
  };

  // Helper functions to convert levels to numeric scores based on the exact scoring system
  const getStressScore = (level) => {
    if (!level || level === "NA" || level === "na") return 1; // Default to low
    const normalizedLevel = level.toLowerCase();
    switch (normalizedLevel) {
      case "low": return 1;
      case "medium": return 2;
      case "high": return 3;
      default: return 1;
    }
  };

  const getAnxietyScore = (level) => {
    if (!level || level === "NA" || level === "na") return 2; // Default to low
    const normalizedLevel = level.toLowerCase();
    switch (normalizedLevel) {
      case "low": return 2;
      case "medium": return 4;
      case "high": return 6;
      default: return 2;
    }
  };

  const getDepressionScore = (level) => {
    if (!level || level === "NA" || level === "na") return 2; // Default to low
    const normalizedLevel = level.toLowerCase();
    switch (normalizedLevel) {
      case "low": return 2;
      case "medium": return 4;
      case "high": return 6;
      default: return 2;
    }
  };

  // Function to get YouTube playlist URL based on health level
  const getYouTubePlaylist = (level) => {
    const playlists = {
      high: "https://youtube.com/playlist?list=PLmWyI2rwIlss9UOuBfmx248Bx6kDdsDTf&si=NOq6fRExtMGTlCC3", // Red
      moderate: "https://youtube.com/playlist?list=PLmWyI2rwIlssty92W0NfEAKQtf5ggtIpj&si=HW-TvEOGZ66y8QZA", // Yellow
      low: "https://youtube.com/playlist?list=PLmWyI2rwIlsuucDLmfPqR69tyW622GLAZ&si=JQ5f1LyP9-yPGpc2" // Green
    };
    return playlists[level] || playlists.moderate;
  };

  // Function to get YouTube embed URL from playlist URL
  const getYouTubeEmbedUrl = (playlistUrl) => {
    const playlistId = playlistUrl.match(/list=([^&]+)/)?.[1];
    if (playlistId) {
      return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
    }
    return null;
  };

  const overallHealthLevel = getOverallHealthLevel();
  
  // Pick a single recommended video to play in the modal
  const singleVideo = recommendations.data?.videos?.[0] || null;

  // Debug logging
  console.log("Overall Health Level:", overallHealthLevel);
  console.log("Patient Data:", patientData);
  console.log("Single Video:", singleVideo);

  return (
    <Center h="100%">
      <Stack gap={24}>
        <Stack
          mx="auto"
          w={474}
          h={380}
          bd={"2px solid #7b7a79"}
          bdrs={"lg"}
          p={4}
        >
          <Text fz={"xl"} ta="center" fw="bold">
            {t("report.alternate-title")}
          </Text>

          <Box flex="1" overflow="auto" w="full">
            <VStack spacing={6} w="full">
              {metrics.map((metric, index) => {
                const value = patientData[metric.key];

                const key = metric.key;

                const displayValue = getDisplayValue(metric, value);
                const arrowIndicatorValue = getIndicatorValue({
                  metric: key,
                  value: LEVELS.includes(displayValue.toLowerCase())
                    ? displayValue.toLowerCase()
                    : displayValue,
                  ageRange: ageRange || null,
                  gender: gender || null,
                });

                const colorValueV2 = getColorV2(arrowIndicatorValue);

                return (
                  <Box
                    bg="#F4F4F4"
                    key={index}
                    w="full"
                    borderRadius={"md"}
                    p={2}
                    boxShadow={`2px 3px 8px 0px rgba(0,0,0,0.15)`}
                  >
                    <HStack justify="space-between" mb="8px">
                      <HStack>
                        <Text
                          fontFamily="Lato"
                          fontSize={16}
                          fontWeight="semibold"
                        >
                          {t(`report.metrics.${metric.name}`)}
                        </Text>
                        {/* <Icon
                            as={InfoIcon}
                            color="#000"
                            onClick={() => handleOpenInfoPopUp(metric)}
                            cursor="pointer"
                          /> */}
                      </HStack>
                      <Text
                        fontFamily="Lato"
                        // color={getColor(displayValue, metric.isNumeric)}
                        color={colorValueV2}
                        fontSize="16px"
                        fontWeight="extrabold"
                        style={{ textTransform: "capitalize" }}
                      >
                        {metric.unit
                          ? `${value} ${metric.unit}`
                          : LEVELS.includes(displayValue.toLowerCase())
                          ? t(`general.${displayValue.toLowerCase()}`)
                          : displayValue}
                      </Text>
                    </HStack>
                    {/* <MetricBarV2 value={metric.isNumeric ? 25 : 100} /> */}
                    <MetricBar value={arrowIndicatorValue} />
                  </Box>
                );
              })}
            </VStack>
          </Box>

          {/* <VStack width="100%" mt="16px">
            <Text fontSize={20} fontFamily="Lato" fontWeight="bold">
              {t("report.legends.title")}
            </Text>
            <VStack width="100%" spacing="8px">
              {legends.map((legend, index) => (
                <HStack
                  width="100%"
                  key={index}
                  justify="center"
                  align="center"
                >
                  <Flex justify="flex-end" height="100%">
                    <Box
                      borderRadius="20px"
                      height="12px"
                      width="106px"
                      bg={legend.color}
                    ></Box>
                  </Flex>
                  <Flex width="40px" height="100%" align="center">
                    <Text
                      fontSize={16}
                      fontWeight="semibold"
                      flex={1}
                      color={legend.color}
                    >
                      {t(`report.legends.${legend.name}`)}
                    </Text>
                  </Flex>
                </HStack>
              ))}
            </VStack>
          </VStack> */}
        </Stack>

        <Stack gap={12} align="center">
          <Stack gap={40} align="center">
            {/* Only show timer message for regular users, not for admin/SCAPE users */}
            {!getCurrentRoleData("admin") && (
              <Text fw={"bold"} ta="center" fz={16} c="dimmed">
                This page will automatically close in {timeLeft} seconds
              </Text>
            )}
            
            {/* Show Next button for admin/SCAPE users */}
            {getCurrentRoleData("admin") && (
              <Button
                variant="brand-filled"
                size="xl"
                bdrs="md"
                onClick={() => setIsModalOpen(true)}
                styles={{
                  root: {
                    backgroundColor: "#E55A2B",
                    "&:hover": {
                      backgroundColor: "#D1451A",
                    }
                  }
                }}
              >
                Next
              </Button>
            )}
            {/* <Button
              variant="brand-filled"
              size="xl"
              bdrs="lg"
              maw={240}
              fz={20}
              styles={{
                label: {
                  whiteSpace: "normal",
                },
              }}
              py={8}
              h="fit-content"
              onClick={() => {
                setStep("waitlist");
              }}
            >
              Tap to Receive Clinical Insights On-the-Go
            </Button> */}
            {/* <Text fw={"bold"} ta="center" fz={"lg"}>
              {t("report.auto-close-message", { count: timeLeft })}
            </Text> */}
          </Stack>
          <Group gap={24}>
            {/* <Button
              variant={"brand"}
              bdrs={"lg"}
              size="xl"
              w={"fit-content"}
              leftSection={<Image src={ExitWithoutArrowIcon} w={20} h={20} />}
              onClick={() => {
                onOpen();
              }}
              c="var(--mantine-color-text-9)"
            >
              {t("general.exit")}
            </Button> */}
          </Group>

          {/* <ExitModal
            isOpen={isOpen}
            onClose={onClose}
            onExit={() => {
              // logoutUser();
              navigate("/booth", {
                state: {
                  showRewards: true,
                },
              });
              setStep("dashboard");

              onClose();
            }}
          /> */}
        </Stack>
      </Stack>

      {/* Auto-close popup modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title=""
        centered
        size="lg"
        withCloseButton={false}
        styles={{
          content: {
            border: "2px solid #E55A2B",
            borderRadius: "12px",
          }
        }}
      >
          <Stack gap="lg" align="center">
            <Text fw="bold" fz={20} ta="center">
            Nice work completing the scan. We've made some videos that might be helpful for where you're at.
          </Text>
          
          {/* Single YouTube Video Embed */}
          <MantineBox w="100%">
            {singleVideo ? (
              <VideoPlayer video={singleVideo} showMetadata={false} />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                  border: "2px solid #E55A2B",
                }}
              >
                <Text fw="bold" fz="lg" c="dimmed">
                  Loading video recommendations...
                </Text>
              </div>
            )}
          </MantineBox>
          
          {/* Call to Action Button */}
          <Button
            variant="brand-filled"
            size="lg"
            fullWidth
            onClick={() => {
              setIsModalOpen(false);
              setStep("clinicalInsights");
              navigate("/booth");
            }}
            styles={{
              root: {
                backgroundColor: "#E55A2B",
                "&:hover": {
                  backgroundColor: "#D1451A",
                }
              }
            }}
          >
         Exit
          </Button>
        </Stack>
      </Modal>
    </Center>
  );
};
