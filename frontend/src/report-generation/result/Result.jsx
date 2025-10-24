import {
  Box,
  Button,
  Flex,
  Image,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useAtomValue, useSetAtom } from "jotai";
import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { getCurrentRoleData } from "../../api-client/auth";
import { saveCandidateAPI } from "../../api/candidate/candidate.api";
import giftRibbon from "../../assets/Group.svg";
import ExitIcon from "../../assets/solar_exit-bold.svg";
import {
  ageAtom,
  boothVenueAtom,
  isFullSizeAtom,
  selectedGenderAtom,
  stepAtom,
  reportIdAtom,
} from "../../atoms";
import {
  BUTTON_DIMENSIONS_HALF,
  BUTTON_DIMENSIONS_QUARTER,
  UPDATED_TAB_SIZES,
} from "../../atoms/sd";
import ExitConfirmationModal from "../../components/ExitConfirmationModal";
import StepCountHeader from "../../components/StepCountHeader";
import { config } from "../../config";
import { brandColor } from "../../theme/styles";

const TIME_LEFT = 30; // time left in seconds
const GIFT_BORDER = "2px solid black";
const PADDED_WIDTH = "100%";

const styles = {
  headerText: {
    fontSize: "32px",
    fontFamily: "Inter",
    fontWeight: "bold",
    textAlign: "center",
  },
  qrContainer: {
    bg: "#F53D3D",
    color: "white",
    padding: "32px",
    borderRadius: "0",
    width: "100%",
    position: "relative",
  },
  resultText: {
    fontSize: "32px",
    fontFamily: "Lato",
    fontWeight: "bold",
    textAlign: "center",
  },
  privacyText: {
    fontSize: "24px",
    fontFamily: "Lato",
    fontWeight: "500",
    textAlign: "center",
  },
};

export const Result = ({ qrValue = "Well station" }) => {
  const { t, i18n } = useTranslation();
  const setStep = useSetAtom(stepAtom);
  const isFullSize = useAtomValue(isFullSizeAtom);
  // const SIZES = isFullSize ? QUARTER_SIZES : HALF_SIZES;
  const SIZES = UPDATED_TAB_SIZES;
  const BUTTON_DIMENSIONS = isFullSize
    ? BUTTON_DIMENSIONS_QUARTER
    : BUTTON_DIMENSIONS_HALF;

  // Check if current language is not English
  const isNotEnglish = i18n.language !== "en";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LEFT);

  const candidateAge = useAtomValue(ageAtom);
  const candidateGender = useAtomValue(selectedGenderAtom);
  const candidateId = useAtomValue(reportIdAtom);
  const boothVenue =
    useAtomValue(boothVenueAtom) || localStorage.getItem("boothVenue");
  const loggedInUser = getCurrentRoleData("admin");

  const userReportIdUrl = useMemo(() => {
    return `${config.REPORT_URL}/${candidateId}?boothVenue=${encodeURIComponent(
      boothVenue
    )}&launch=${encodeURIComponent(loggedInUser?.launch || "default")}`;
  }, [candidateId]);

  const handleExit = useCallback(() => setIsModalOpen(true), []);

  const saveCandidate = async () => {
    const candidate = {
      ageRange: candidateAge,
      gender: candidateGender,
      userID: candidateId,
    };

    const response = await saveCandidateAPI(candidate);
    console.log(response);
  };

  const confirmExit = () => {
    setStep("sessionComplete");
    setIsModalOpen(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up - redirect to session complete
          setStep("sessionComplete");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setStep]);

  const breakPointValues = {
    headerSize: {
      base: "16px",
      sm: "32px",
      md: "32px",
      lg: "16px",
      xl: SIZES[20],
    },
    subHeaderSize: {
      base: "12px",
      sm: "24px",
      md: "24px",
      lg: "12px",
      xl: SIZES[24],
    },
    giftRibbonHeight: {
      base: "30px",
      sm: "80px",
      md: "80px",
      lg: "32px",
      xl: SIZES[52],
    },
    giftRibbonBorder: {
      base: "2px solid black",
      sm: "4px solid black",
      md: "4px solid black",
      lg: "2px solid black",
      xl: `${SIZES[2]} solid black`,
    },
    qrCodeContainerMinHeight: {
      base: "160px",
      sm: "300px",
      md: "300px",
      lg: "160px",
      xl: SIZES[192],
    },
    qrCodeSize: {
      base: 100,
      sm: 200,
      md: 200,
      lg: 100,
      xl: parseInt(SIZES[144]),
    },
    exitButtonBottomMargin: {
      base: 8,
      sm: "80px",
      md: "100px",
      lg: 8,
      xl: SIZES[8],
    },
    buttonPadding: {
      base: "16px 32px",
      sm: "32px 64px",
      md: "32px 64px",
      lg: "0 32px",
      xl: `0`,
    },
    exitButtonIconSize: {
      base: 15,
      sm: 30,
      md: 30,
      lg: 15,
      xl: parseInt(SIZES[15]),
    },
  };

  const headerSize = useBreakpointValue(breakPointValues.headerSize);
  const subHeaderSize = useBreakpointValue(breakPointValues.subHeaderSize);

  const giftRibbonHeight = useBreakpointValue(
    breakPointValues.giftRibbonHeight
  );
  const giftRibbonBorder = useBreakpointValue(
    breakPointValues.giftRibbonBorder
  );
  const qrCodeContainerMinHeight = useBreakpointValue(
    breakPointValues.qrCodeContainerMinHeight
  );
  const qrCodeSize = useBreakpointValue(breakPointValues.qrCodeSize);
  const exitButtonBottomMargin = useBreakpointValue(
    breakPointValues.exitButtonBottomMargin
  );
  const buttonPadding = useBreakpointValue(breakPointValues.buttonPadding);
  const exitButtonIconSize = useBreakpointValue(
    breakPointValues.exitButtonIconSize
  );

  return (
    <>
      <Flex
        flexDirection="column"
        width="100%"
        height="100%"
        align="center"
        padding="0px 120px 0px 120px"
      >
        <Flex width={PADDED_WIDTH} align="flex-start" gap="4" mb={2}>
          <Box>
            <StepCountHeader step={3} totalSteps={3} />
          </Box>
          <Flex direction="column" gap={0}>
            <Text
              width="80%"
              margin="auto"
              fontSize={{ base: "24px", md: "0px", xl: SIZES[24] }}
              textAlign="center"
              fontFamily="Poetsen One"
              fontWeight="bold"
              color="#F5703D"
              lineHeight="1.2"
              marginTop={10}
            >
              {t("result.congratulations")}
            </Text>
          </Flex>
        </Flex>

        <Flex
          width="100%"
          align="center"
          flexDirection="column"
          flex={1}
          position="relative"
        >
          {/* Result Message */}
          <Flex
            width={PADDED_WIDTH}
            align="center"
            justify="center"
            flexDirection="column"
            mt="12px"
            mb="40px"
            px={48}
          >
            <Text
              fontSize={headerSize}
              fontFamily="Lato"
              fontWeight="bold"
              textAlign="center"
            >
              {t("result.completionMessage")}
            </Text>
          </Flex>

          <Box
            position="relative"
            width="100%"
            maxWidth="720px"
            mx="auto"
            mt={8}
          >
            <Box
              position="absolute"
              top="-55px"
              left="50%"
              transform="translateX(-50%)"
              zIndex={2}
            >
              <Image src={giftRibbon} height="60px" />
            </Box>

            {/* QR Code Container with curved corners */}
            <Flex
              bg="#F53D3D"
              borderRadius="12px"
              p={8}
              color="white"
              flexDirection={{ base: "column", md: "row" }}
              align="center"
              gap={8}
              position="relative"
              border="3px solid black"
            >
              <Box
                bg="white"
                p={1}
                borderRadius="5px"
                boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
                border="1px solid black"
              >
                <QRCode value={userReportIdUrl} size={qrCodeSize} />
              </Box>

              {/* Text Content */}
              <Flex flexDirection="column" gap={4} flex={1}>
                <Text
                  fontSize={{ base: "24px", md: "32px", xl: SIZES[20] }}
                  fontWeight="bold"
                  color="white"
                  fontFamily="Lato"
                  lineHeight="1.2"
                >
                  {t("result.qrInstructions")}
                </Text>
                <Text
                  fontSize={{ base: "16px", md: "18px", xl: SIZES[16] }}
                  color="white"
                  fontWeight="regular"
                  fontFamily="Lexend"
                  lineHeight="1.5"
                >
                  {t("result.privacyMessage")}
                </Text>
              </Flex>
            </Flex>
          </Box>

          {/* Privacy Message */}
          <Flex
            marginBottom="24px"
            marginTop="24px"
            width={PADDED_WIDTH}
            align="center"
            justify="center"
          >
            <Text
              {...styles.resultText}
              fontSize={headerSize}
              fontWeight="bold"
            >
              {t("result.autoCloseMessage", { seconds: timeLeft })}
            </Text>
          </Flex>

          {/* Exit Button */}
          <Flex
            as={Button}
            onClick={handleExit}
            variant="brand"
            bg={brandColor}
            color="brand.100"
            height={isNotEnglish ? "auto" : BUTTON_DIMENSIONS.height}
            width={isNotEnglish ? "auto" : BUTTON_DIMENSIONS.width}
            px={isFullSize ? "24px" : "24px"}
            py={isFullSize ? "12px" : "24px"}
            borderRadius={isFullSize ? "6px" : "12px"}
            _hover={{ bg: "#B13100", color: "#fff" }}
            _active={{ bg: "#B13100", color: "#fff" }}
            boxShadow=" 3px 5px 10px 0px rgba(247,141,100,1)"
            gap="16px"
          >
            <img
              src={ExitIcon}
              height={exitButtonIconSize}
              width={exitButtonIconSize}
              alt="Exit"
            />
            <Text fontSize={headerSize} fontWeight="bold">
              {t("result.exit")}
            </Text>
          </Flex>
        </Flex>

        <ExitConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmExit}
        />
      </Flex>
      {/* <LanguageSelector /> */}
    </>
  );
};

Result.propTypes = {
  qrValue: PropTypes.string,
};
