import { Flex, Text, useBreakpointValue } from "@chakra-ui/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ageAtom,
  boothVenueAtom,
  paddedWidthAtom,
  selectedGenderAtom,
  stepAtom,
  reportIdAtom,
} from "../atoms";
import { UPDATED_TAB_SIZES } from "../atoms/sd";
import LoadingSpinnerAnimation from "../components/LoadingSpinnerAnimation";
import { logoutUser } from "../api-client";

// Constants
const COUNT_DOWN_TIME = 2000; //2 seconds

export const SessionComplete = () => {
  const { t } = useTranslation();
  const setStep = useSetAtom(stepAtom);
  const setSelectGender = useSetAtom(selectedGenderAtom);
  const setAge = useSetAtom(ageAtom);
  const setReportId = useSetAtom(reportIdAtom);
  const setBoothVenue = useSetAtom(boothVenueAtom);
  const paddedWidth = useAtomValue(paddedWidthAtom);
  // const SIZES = isFullSize ? QUARTER_SIZES : HALF_SIZES;
  const SIZES = UPDATED_TAB_SIZES;

  // Responsive breakpoint values
  const breakPointValues = {
    textFontSize: {
      base: "16px",
      sm: "28px",
      md: "28px",
      lg: "16px",
      xl: SIZES[24],
    },
    binImageSize: {
      base: "44px",
      sm: "86px",
      md: "86px",
      lg: "44px",
      xl: SIZES[80],
    },
    containerGap: {
      base: "16px",
      sm: "32px",
      md: "32px",
      lg: "16px",
      xl: "10px",
    },
  };

  // Dynamic values based on breakpoints
  const textFontSize = useBreakpointValue(breakPointValues.textFontSize);

  const clearLocalStorageMetaData = () => {
    const keys = Object.keys(localStorage);

    const filesToRemove = keys.filter(
      (key) =>
        key.startsWith("audio_metadata_voice-recording") ||
        key.startsWith("video_metadata_facial-analysis")
    );

    filesToRemove.forEach((key) => localStorage.removeItem(key));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectGender("");
      setAge("");
      setReportId("");
      setBoothVenue("");
      setStep("welcome");
      clearLocalStorageMetaData();
      logoutUser();
    }, COUNT_DOWN_TIME);

    return () => clearTimeout(timer);
  }, [setStep, setSelectGender, setAge, setReportId, setBoothVenue]);

  return (
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      alignItems="center"
      justify="center"
    >
      <Flex
        flexDirection="column"
        align="center"
        justify="center"
        width={paddedWidth}
        margin="auto"
      >
        <Text fontFamily="Lato" fontSize={textFontSize} fontWeight="extrabold">
          {t("sessionComplete.message")}
        </Text>

        <Flex marginTop={SIZES[28]}>
          <LoadingSpinnerAnimation />
          {/* <DustbinAnimation size={binImageSize} /> */}
        </Flex>
      </Flex>
    </Flex>
  );
};
