import { Box, Flex, Text, VStack, useBreakpointValue } from "@chakra-ui/react";
import * as faceapi from "face-api.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  uploadCandidateVideo,
  uploadCandidateVideoTrial,
} from "../api/candidate/candidate.api";
import {
  ageAtom,
  boothVenueAtom,
  paddedWidthAtom,
  selectedGenderAtom,
  stepAtom,
  reportIdAtom,
  trialIdAtom,
} from "../atoms";
import { UPDATED_TAB_SIZES } from "../atoms/sd";
import StepCountHeader from "../components/StepCountHeader";
import CustomProgressBar from "../components/progressBar/ProgressBar";
import { Center } from "@mantine/core";
import { getCurrentRoleData } from "../api-client";
import { useLocation } from "react-router";

const FacialAnalysis = () => {
  const { t, i18n } = useTranslation();
  // OLD BEHAVIOR: Only get user role data
  // const userData = getCurrentRoleData("user");
  
  // NEW BEHAVIOR: Get data from either user or admin role
  const userData = getCurrentRoleData("user") || getCurrentRoleData("admin");

  const setStep = useSetAtom(stepAtom);
  const paddedWidth = useAtomValue(paddedWidthAtom);
  const reportId = useAtomValue(reportIdAtom);
  const boothVenue =
    useAtomValue(boothVenueAtom) || localStorage.getItem("boothVenue");
  const candidateAge = useAtomValue(ageAtom);
  const candidateGender = useAtomValue(selectedGenderAtom);

  const location = useLocation();

  const trialId = useAtomValue(trialIdAtom);
  const SIZES = UPDATED_TAB_SIZES;

  const breakPointValues = {
    cameraContainerWidth: {
      base: "96%",
      sm: "65%",
      md: "300px",
      lg: "334px",
      xl: SIZES[400],
    },
    cameraContainerHeight: {
      base: "94%",
      sm: "92%",
      md: "92%",
      lg: "96%",
      xl: SIZES[480],
    },
    mainFontSize: {
      base: "20px",
      sm: "40px",
      md: "40px",
      lg: "24px",
      xl: SIZES[64],
    },
    cameraContainerMarginTop: {
      base: "-24px",
      sm: "-40px",
      md: "-40px",
      lg: "-20px",
      xl: "-80px",
    },
  };

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasMask, setHasMask] = useState(false);

  const [previousPosition, setPreviousPosition] = useState(null);

  const mainFontSize = useBreakpointValue(breakPointValues.mainFontSize);

  const cameraContainerMarginTop = useBreakpointValue(
    breakPointValues.cameraContainerMarginTop
  );

  const cameraScreenOvalBorder =
    errorMessage?.length > 0 ? "8px dashed #FF7575" : "8px solid #FF7575";

  // Function to add log entries to console (for debugging)
  const addLog = (message) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
  };

  // Function to generate a unique filename for the video
  const generateUniqueFilename = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const randomString = Math.random().toString(36).substring(2, 10);
    return `facial-analysis-${timestamp}-${randomString}.mp4`;
  };

  useEffect(() => {
    startCamera();

    return () => {
      // Clean up resources when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [t]);

  useEffect(() => {
    if (!isCameraReady) return;

    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      startAnalysis();
    }
  }, [countdown, isCameraReady]);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  // Load face-api.js models once
  useEffect(() => {
    const loadModels = async () => {
      const modelPath = window.electron ? "./models" : "/models";

      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
          faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
          faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
        ]);
      } catch (error) {
        console.error("Failed to load face-api models:", error);
        setErrorMessage(t("facialAnalysis.modelLoadError"));
      }
    };
    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      if (!window.navigator?.mediaDevices?.getUserMedia) {
        setErrorMessage(t("facialAnalysis.mediaDevicesNotSupported"));
        addLog("MediaDevices API is not supported in this environment.");
        return;
      }

      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: true, // Enable audio for the recording
      };

      window.navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = async () => {
              try {
                await videoRef.current.play();
                setIsCameraReady(true);
                addLog("Camera ready and streaming");
              } catch (playError) {
                console.error("Error playing video:", playError);
                setErrorMessage(t("facialAnalysis.cameraPlayError"));
              }
            };
          }
        })
        .catch((error) => {
          console.error("Camera initialization error:", error);
          if (error.name === "NotAllowedError") {
            setErrorMessage(t("facialAnalysis.permissionDenied"));
          } else if (error.name === "NotFoundError") {
            setErrorMessage(t("facialAnalysis.cameraNotFound"));
          } else {
            setErrorMessage(t("facialAnalysis.cameraError"));
          }
        });
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrorMessage(t("facialAnalysis.cameraError"));
    }
  };

  const startAnalysis = () => {
    if (!streamRef.current || !videoRef.current) {
      setErrorMessage(t("facialAnalysis.cameraError"));
      return;
    }

    // Reset recorded chunks
    recordedChunksRef.current = [];
    setIsRecording(true);

    try {
      // Create MediaRecorder instance
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);

      // Event handler for data chunks
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      // Event handler for recording stop
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        addLog("Recording stopped");

        try {
          // Create a Blob from recorded chunks
          const videoBlob = new Blob(recordedChunksRef.current, {
            type: "video/mp4",
          });
          const videoSize = (videoBlob.size / (1024 * 1024)).toFixed(2); // Size in MB
          addLog(`Video size: ${videoSize} MB`);

          // Generate a unique filename
          const filename = generateUniqueFilename();
          addLog(`Video saved with filename: ${filename}`);

          // Store metadata in localStorage
          try {
            const metadata = {
              filename,
              timestamp: new Date().toISOString(),
              size: videoSize,
            };
            localStorage.setItem(
              `video_metadata_${filename}`,
              JSON.stringify(metadata)
            );
            addLog("Stored facial analysis metadata in localStorage");
          } catch (storageError) {
            addLog(`Failed to store metadata: ${storageError.message}`);
          }

          // Upload the video - this will handle the transition to next step
          await uploadVideo(filename, videoBlob);

          // Reset recorded chunks after processing
          recordedChunksRef.current = [];
        } catch (error) {
          addLog(`Error processing video: ${error.message}`);
          setErrorMessage("Error processing video. Proceeding to next step.");

          // Still proceed to next step despite error
          setTimeout(() => {
            setStep("voiceScanning");
          }, 1500);
        }
      };

      // Start recording with 1-second chunks
      mediaRecorderRef.current.start(1000);
      addLog("Recording started");

      // Set timeout to stop recording after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          addLog("Auto-stopping after 30 seconds");
          mediaRecorderRef.current.stop();
        }
      }, 30000);

      // Start progress bar timer
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = Math.min(prev + 1, 100);
          if (newProgress === 100) clearInterval(progressIntervalRef.current);
          return newProgress;
        });
      }, 300); // Complete in 30 seconds

      // Face detection
      detectionIntervalRef.current = setInterval(async () => {
        await detectFaces(videoRef.current);
      }, 500); //
    } catch (error) {
      console.error("Error starting analysis:", error);
      setErrorMessage(`Error starting analysis: ${error.message}`);
    }
  };

  const detectFaces = async (videoElement) => {
    try {
      const detections = await faceapi
        .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      console.log("<= detections", detections);

      if (detections.length === 0) {
        setErrorMessage(t("facialAnalysis.noFaceDetected"));
      }
      // else if (detections.length > 1) {
      //   setErrorMessage(t("facialAnalysis.multipleFaces"));
      // }
      else {
        const face = detections[0];
        const landmarks = detections[0].landmarks;
        const detectionBox = detections[0].detection.box;

        if (checkForMask(face)) {
          setErrorMessage(t("facialAnalysis.faceObstructed"));
        } else if (isFaceObstructed(landmarks)) {
          setErrorMessage(t("facialAnalysis.faceObstructed"));
        } else if (isTooMuchMovement(detectionBox)) {
          setErrorMessage(t("facialAnalysis.tooMuchMovement"));
        } else {
          setErrorMessage("");
        }
      }
    } catch (error) {
      console.error("Face detection error:", error);
      setErrorMessage(t("facialAnalysis.detectionError"));
    }
  };

  const isFaceObstructed = (landmarks) => {
    const nose = landmarks.getNose();
    const mouth = landmarks.getMouth();
    const noseToMouthDistance = Math.abs(nose[3].y - mouth[0].y);
    return noseToMouthDistance < 20; // Example: Mask might shorten this distance
  };

  const isTooMuchMovement = (currentPosition) => {
    if (!previousPosition) {
      setPreviousPosition(currentPosition);
      return false;
    }

    const movementThreshold = 20; // Adjusted for sensitivity
    const dx = Math.abs(currentPosition._x - previousPosition._x);
    const dy = Math.abs(currentPosition._y - previousPosition._y);
    const isMoving = dx > movementThreshold || dy > movementThreshold;

    setPreviousPosition(currentPosition);
    return isMoving;
  };

  const checkForMask = (face) => {
    // Check nose and mouth landmarks visibility
    const noseVisible = face.landmarks.getNose().every((pt) => pt._x && pt._y);
    const mouthVisible = face.landmarks
      .getMouth()
      .every((pt) => pt._x && pt._y);

    // Simple mask detection logic (adjust thresholds as needed)
    setHasMask(!noseVisible || !mouthVisible);
  };

  const uploadVideo = async (filename, videoBlob) => {
    if (!reportId && !location.state?.isTrial) {
      addLog("Error: Report id is required for upload");
      return { success: false, error: "Report id is missing" };
    }

    if (!trialId && location.state?.isTrial) {
      return { success: false, error: "Trial id is missing" };
    }

    addLog(`Preparing to upload ${filename}...`);

    try {
      // Create FormData with the video file and user ID
      const formData = new FormData();
      formData.append("videoFile", videoBlob, filename);
      if (trialId) {
        formData.append("trial_id", trialId);
      } else {
        formData.append("userId", reportId);
      }
      formData.append("language", i18n.language);
      formData.append("venue", boothVenue);
      formData.append("ageRange", candidateAge);
      formData.append("gender", candidateGender);
      formData.append("email", userData?.email || "");

      addLog(`Uploading to API endpoint...`);

      setTimeout(() => {
        setStep("voiceScanning");
      }, 0);

      let response = undefined;

      if (trialId) {
        response = await uploadCandidateVideoTrial(formData);
      } else {
        response = await uploadCandidateVideo(formData);
      }

      if (response?.ok) {
        addLog(
          `Upload successful! Server responded with status: ${response?.status}`
        );

        // Delete video metadata from localStorage after successful upload
        localStorage.removeItem(`video_metadata_${filename}`);
        addLog(`Video metadata ${filename} deleted from localStorage`);

        // Proceed to next step after 1.5 seconds

        return { success: true };
      } else {
        addLog(`Upload failed with status: ${response.status}`);

        // Still proceed to next step after a delay
        setTimeout(() => {
          setStep("voiceScanning");
        }, 1500);

        return { success: false, error: `HTTP error: ${response.status}` };
      }
    } catch (error) {
      addLog(`Upload error: ${error.message}`);

      addLog("Skipping upload attempt, proceeding to the next step.");

      // Still proceed to next step after a delay
      setTimeout(() => {
        setStep("voiceScanning");
      }, 1500);

      return { success: false, error: error.message };
    }
  };

  const getProgressMessage = (progress) => {
    if (progress === 100 && isRecording) {
      return (
        <VStack spacing={1}>
          <Text
            color="white"
            fontFamily="Lato"
            fontSize={mainFontSize}
            fontWeight="bold"
            textAlign="center"
          >
            {t("facialAnalysis.uploading.line1")}
          </Text>
          <Text
            color="white"
            fontFamily="Lato"
            fontSize={mainFontSize}
            fontWeight="bold"
            textAlign="center"
          >
            {t("facialAnalysis.uploading.line2")}
          </Text>
        </VStack>
      );
    }

    let messageKey;
    if (progress < 25) messageKey = "initial";
    else if (progress < 50) messageKey = "quarter";
    else if (progress < 75) messageKey = "half";
    else if (progress < 100) messageKey = "almostDone";
    else messageKey = "complete";

    return (
      <VStack spacing={1}>
        <Text
          color="white"
          fontFamily="Lato"
          fontSize={mainFontSize}
          fontWeight="bold"
          textAlign="center"
        >
          {t(`facialAnalysis.scanningProgress.${messageKey}.line1`)}
        </Text>
        <Text
          color="white"
          fontFamily="Lato"
          fontSize={mainFontSize}
          fontWeight="bold"
          textAlign="center"
        >
          {t(`facialAnalysis.scanningProgress.${messageKey}.line2`)}
        </Text>
      </VStack>
    );
  };

  const renderContent = () => {
    if (errorMessage) {
      return (
        <Box width="100%">
          <Text
            margin="auto"
            width="80%"
            textAlign="center"
            color="#FFFFFF"
            fontFamily="Lato"
            fontSize="20px"
            fontWeight="bold"
          >
            {errorMessage}
          </Text>
        </Box>
      );
    }

    if (countdown > 0) {
      return (
        <VStack spacing={1}>
          <Text
            color="#fff"
            fontFamily="Lato"
            fontSize={mainFontSize}
            fontWeight="extrabold"
          >
            {t("facialAnalysis.scanningStartIn")}
          </Text>
          <Text
            color="#fff"
            fontFamily="Lato"
            fontSize={mainFontSize}
            fontWeight="bold"
          >
            {countdown}
          </Text>
        </VStack>
      );
    }

    return getProgressMessage(progress);
  };

  return (
    <>
      <Flex
        flexDirection="column"
        width={paddedWidth}
        height="100%"
        margin="auto"
        align={"center"}
      >
        <Flex width="100%" align="flex-start" justify="flex-start">
          <Box width="auto" marginRight="40px">
            <StepCountHeader step={1} totalSteps={3} />
          </Box>
        </Flex>

        <Flex
          width="100%"
          minH="400px"
          flex={1}
          direction="column"
          align="center"
          justify="center"
          gap={2}
          mt={cameraContainerMarginTop}
        >
          <Box
            position="relative"
            w={646}
            height={774}
            borderRadius="50%"
            overflow="hidden"
            boxShadow="0px 0px 20px rgba(0, 0, 0, 0.1)"
            bg="white"
          >
            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              overflow="hidden"
              borderRadius="50%"
              border={cameraScreenOvalBorder}
              transition="all 0.3s ease"
              bg="blackAlpha.10"
            >
              <video
                id="video"
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)",
                }}
              />
            </Box>

            {isRecording && (
              <Box
                position="absolute"
                top="10px"
                right="10px"
                width="15px"
                height="15px"
                borderRadius="50%"
                bg="red.500"
                zIndex={3}
                animation="pulse 1.5s infinite"
                sx={{
                  "@keyframes pulse": {
                    "0%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
            )}

            {progress === 100 && (
              <Box
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                borderRadius="50%"
                border="8px solid #4CAF50"
                zIndex={2}
              />
            )}

            <Flex
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.20"
              justify="center"
              align="center"
              flexDirection="column"
              color="gray.800"
              zIndex={1}
            >
              {renderContent()}
            </Flex>
          </Box>
        </Flex>

        <Center w={654} ta="center">
          <CustomProgressBar
            progress={progress}
            // isUploading={isUploading}
            textKeyWord={"Scanning"}
            textFontSize={mainFontSize}
          />
        </Center>
      </Flex>
    </>
  );
};

export default FacialAnalysis;
