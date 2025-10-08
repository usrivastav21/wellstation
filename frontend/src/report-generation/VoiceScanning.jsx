import {
  AbsoluteCenter,
  List,
  ListIcon,
  ListItem,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Stack, Text, Box, Button, Center, Image } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { FaCircle } from "react-icons/fa6";
import { stepAtom, reportIdAtom, trialIdAtom } from "../atoms";

import { UPDATED_TAB_SIZES } from "../atoms/sd";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  uploadCandidateAudio,
  uploadCandidateAudioTrial,
} from "../api/candidate/candidate.api";
import MicIcon from "../assets/Microphone.png";
import StepCountHeader from "../components/StepCountHeader";
import LowVolume from "../components/modals/LowVolume";
import NoSpeech from "../components/modals/NoSpeech";
import CustomProgressBar from "../components/progressBar/ProgressBar";
import SoundWaveAnimation from "../components/sound/SoundAnimation";
import "./animation.style.css";
import vad from "./vad";
import classes from "./VoiceScanning.module.css";

export const VoiceScanning = () => {
  const voiceActivityDetection = useRef(null);
  const SIZES = UPDATED_TAB_SIZES;

  const reportId = useAtomValue(reportIdAtom);
  const trialId = useAtomValue(trialIdAtom);
  const { t } = useTranslation();

  const fontSizes = {
    mainHeader: {
      base: "1rem",
      sm: "2rem",
      md: "2rem",
      lg: "2rem",
      xl: SIZES[24],
    },
    suggestionHeader: {
      base: "1rem",
      sm: "2rem",
      md: "2rem",
      lg: "2rem",
      xl: SIZES[24],
    },
    subSize: {
      base: "12px",
      sm: "24px",
      md: "24px",
      lg: "12px",
      xl: SIZES[20],
    },
    mainBoxHeader: {
      base: "16px",
      sm: "32px",
      md: "32px",
      lg: "16px",
      xl: SIZES[24],
    },
  };

  const setStep = useSetAtom(stepAtom);

  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [showSilencePopup, setShowSilencePopup] = useState(false);
  const [showLowVolumePopup, setShowLowVolumePopup] = useState(false);

  const mediaRecorderRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);

  const mainHeaderFontSize = useBreakpointValue(fontSizes.mainHeader);

  const audioFileType = "audio/x-wav";
  const audioFileExtension = ".wav";

  const generateUniqueFilename = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const randomString = Math.random().toString(36).substring(2, 10);
    return `voice-recording-${timestamp}-${randomString}${audioFileExtension}`;
  };

  const handleVadCallback = (state) => {
    console.log("<= state", state);
    if (state === "silence") {
      setShowSilencePopup(true);
      setShowLowVolumePopup(false);
    } else if (state === "lowVolume") {
      setShowLowVolumePopup(true);
      setShowSilencePopup(false);
    } else if (state === "normal") {
      setShowSilencePopup(false);
      setShowLowVolumePopup(false);
    }
  };

  const uploadAudio = async (filename, audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audioFile", audioBlob, filename);
      if (trialId) {
        formData.append("trial_id", trialId);
      } else {
        formData.append("userId", reportId);
      }

      let response = undefined;

      if (trialId) {
        response = await uploadCandidateAudioTrial(formData);
      } else {
        response = await uploadCandidateAudio(formData);
      }
      if (response) {
        localStorage.removeItem(`audio_metadata_${filename}`);
        console.log(`Audio metadata ${filename} deleted from localStorage`);
        return { success: true };
      } else {
        console.error("Upload failed: No response from API");
        return { success: false, error: "No response from API" };
      }
    } catch (error) {
      console.error(`Upload error: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      micStreamRef.current = stream;

      // Set up Web Audio API
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();

      // Initialize VAD (Voice Activity Detection)
      voiceActivityDetection.current = vad(
        analyserRef.current,
        handleVadCallback,
        {
          silenceThreshold: 1,
          lowVolumeThreshold: 10,
          checkInterval: 50,
          silenceDuration: 2000, // 2 seconds for silence
          lowVolumeDuration: 1000, // 1 seconds for low volume
        }
      );

      source.connect(analyserRef.current);

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: audioFileType });
        setAudioBlob(audioBlob);

        const filename = generateUniqueFilename();
        const audioSize = (audioBlob.size / (1024 * 1024)).toFixed(2);

        try {
          const metadata = {
            filename,
            timestamp: new Date().toISOString(),
            size: audioSize,
          };
          localStorage.setItem(
            `audio_metadata_${filename}`,
            JSON.stringify(metadata)
          );
          console.log("Stored audio metadata in localStorage");

          // Download the audio blob directly (alternative approach)
          // saveAs(audioBlob, filename);
        } catch (storageError) {
          console.error(`Failed to store metadata: ${storageError.message}`);
        }

        stream.getTracks().forEach((track) => track.stop());
        cleanupRecording();

        setIsUploading(true);

        setStep("analysisLoading");

        const uploadResult = await uploadAudio(filename, audioBlob);

        setIsUploading(false);

        if (uploadResult && uploadResult.success) {
          console.log("", uploadResult.success);
        } else {
          console.error(
            "Audio upload failed:",
            uploadResult?.error || "Unknown error"
          );
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      initializeProgress();

      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 30000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Unable to access microphone. Please check your permissions.");
    }
  };

  const cleanupRecording = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setProgress(0);
  };

  const initializeProgress = () => {
    setProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current);
          return 100;
        }
        return prev + 100 / (30000 / 300);
      });
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const handleModalClose = () => {
    setShowSilencePopup(false);
    setShowLowVolumePopup(false);

    // Restart VAD monitoring
    if (analyserRef.current) {
      voiceActivityDetection.current = vad(
        analyserRef.current,
        handleVadCallback,
        {
          silenceThreshold: 1,
          lowVolumeThreshold: 10,
          checkInterval: 50,
          silenceDuration: 2000,
          lowVolumeDuration: 1000,
        }
      );
    }
  };

  useEffect(() => {
    return () => {
      if (voiceActivityDetection.current) {
        voiceActivityDetection.current();
        voiceActivityDetection.current = null;
      }
    };
  }, []);

  return (
    <>
      <LowVolume isOpen={showLowVolumePopup} onClose={handleModalClose} />
      <NoSpeech isOpen={showSilencePopup} onClose={handleModalClose} />

      <Stack align="center" pos={"relative"} gap={44}>
        <AbsoluteCenter
          axis="vertical"
          top={{
            sm: 10,
            md: 12,
          }}
          left={{ sm: -20, md: -32, lg: 0 }}
        >
          <StepCountHeader step={2} totalSteps={3} />
        </AbsoluteCenter>

        <Stack gap={12} position="relative" ta="center">
          <Text lh={1.2} fw="bold" fz="xl">
            {t("voiceScanning.alternate-title-1")}
          </Text>
          <Text lh={1.2} fw="bold" fz="xl">
            {t("voiceScanning.alternate-title-2")}
          </Text>
          <Text lh={1.2} fw="bold" fz="xl">
            {t("voiceScanning.alternate-title-3")}
          </Text>
          {/* <Text
              fontSize={{
                base: "1rem",
                sm: "1.2rem",
                md: "1.4rem",
                lg: "1.6rem",
              }}
              fontFamily="Lato"
              fontWeight="bold"
              marginTop="0px"
              marginBottom="0px"
              paddingBottom="0px"
              paddingTop="0px"
            >
              {t("voiceScanning.suggestionHeader")}
            </Text> */}
        </Stack>

        <Stack align="center" gap={44}>
          <Box
            bg="white"
            px={48}
            py={32}
            bdrs={"xl"}
            bd={"4px solid var(--mantine-color-brandDark-6)"}
            pos="relative"
          >
            <Box
              pos="absolute"
              left={-28}
              top="50%"
              w={24}
              h={24}
              bg="white"
              className={classes.chatbox}
            />

            <List>
              {t("voiceScanning.questions", {
                returnObjects: true,
              }).map((question, index) => (
                <ListItem
                  key={index}
                  fontSize={"var(--mantine-font-size-3xl)"}
                  display={"flex"}
                  alignItems={"flex-start"}
                  lineHeight={"1.5"}
                >
                  <ListIcon
                    as={FaCircle}
                    width={"10px"}
                    height={"10px"}
                    mr={3}
                    mt={"0.6em"}
                    flexShrink={0}
                  />

                  <Box flex={1}>{question}</Box>
                </ListItem>
              ))}
            </List>
          </Box>

          {isRecording ? (
            <Center
              id="shakeAnimation"
              gap={2}
              className="shake-animation"
              mt={20}
            >
              <SoundWaveAnimation direction="right-to-left" />
              <Image
                src={MicIcon}
                alt="Recording"
                w={80}
                h={80}
                fit="contain"
              />
              <SoundWaveAnimation direction="left-to-right" />
            </Center>
          ) : (
            <Stack gap={16} ta="center" align="center">
              <Text fz="3xl" fw="bold">
                {t("voiceScanning.startInstruction")}
              </Text>
              <Button
                w={654}
                size="xxl"
                variant="brand-filled"
                bdrs="lg"
                bd="4px solid var(--mantine-color-text-9)"
                onClick={startRecording}
              >
                {t("voiceScanning.startButton")}
              </Button>
            </Stack>
          )}

          <Center w={654} ta="center">
            <CustomProgressBar
              progress={progress}
              isUploading={isUploading}
              textKeyWord={
                isUploading
                  ? t("voiceScanning.uploadingText")
                  : t("voiceScanning.scanningText")
              }
              textFontSize={mainHeaderFontSize}
            />
          </Center>
        </Stack>
      </Stack>
      {/* <LanguageSelector /> */}
    </>
  );
};
