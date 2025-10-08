import {
  Button,
  Flex,
  Text,
  VStack,
  useBreakpointValue,
  Image,
} from "@chakra-ui/react";
import { useAtomValue, useSetAtom } from "jotai";
import { paddedWidthAtom, stepAtom, isFullSizeAtom } from "../atoms";
import { useTranslation } from "react-i18next";
import ExitIcon from "../assets/header_exit_icon.svg";
import {
  BUTTON_DIMENSIONS_HALF,
  BUTTON_DIMENSIONS_QUARTER,
  UPDATED_TAB_SIZES,
} from "../atoms/sd";

const ConsentDeclined = () => {
  const setStep = useSetAtom(stepAtom);
  const paddedWidth = useAtomValue(paddedWidthAtom);
  const { t, i18n } = useTranslation();
  const isNotEnglish = i18n.language !== "en";
  const isFullSize = useAtomValue(isFullSizeAtom);
  // const SIZES = isFullSize ? QUARTER_SIZES : HALF_SIZES;
  const SIZES = UPDATED_TAB_SIZES;

  const BUTTON_DIMENSIONS = isFullSize
    ? BUTTON_DIMENSIONS_QUARTER
    : BUTTON_DIMENSIONS_HALF;

  const scrollbarStyles = {
    "&::-webkit-scrollbar": {
      display: "none",
    },
    scrollbarWidth: "none",
    "-ms-overflow-style": "none",
  };

  const fontSizes = {
    mainHeader: {
      base: "28px",
      sm: "40px",
      md: "40px",
      lg: "32px",
      xl: SIZES[24],
    },
    mainDescription: {
      base: "16px",
      sm: "24px",
      md: "24px",
      lg: "18px",
      xl: SIZES[20],
    },
    buttonText: {
      base: "16px",
      sm: "20px",
      md: "32px",
      lg: "16px",
      xl: SIZES[24],
    },
  };

  const fontSizeBreakpoints = {
    mainHeader: useBreakpointValue(fontSizes.mainHeader),
    mainDescription: useBreakpointValue(fontSizes.mainDescription),
    buttonText: useBreakpointValue(fontSizes.buttonText),
  };

  const handleExit = () => setStep("welcome");

  return (
    <Flex
      flexDirection="column"
      width="100%"
      height="100%"
      p={1}
      overflowY="scroll"
      css={scrollbarStyles}
      position="relative"
      padding={{
        base: "0px 20px",
        sm: "0px 40px",
        md: "0px 60px",
        lg: "0px 120px",
        xl: "0px 180px",
      }}
    >
      <VStack
        width={paddedWidth}
        margin="auto"
        height="100%"
        align="center"
        justify="center"
        overflowY="scroll"
        flex={1}
        spacing={{
          base: "16px",
          sm: "20px",
          md: "24px",
          lg: "20px",
          xl: "20px",
        }}
        py={{ base: "40px", sm: "60px", md: "80px", lg: "60px", xl: "60px" }}
      >
        <Text
          textAlign="center"
          fontFamily="Lato"
          fontSize={fontSizeBreakpoints.mainHeader}
          fontWeight="800"
          color="black"
          mb={{ base: "8px", sm: "12px", md: "16px", lg: "12px", xl: "12px" }}
        >
          {t("consentDeclined.title")}
        </Text>

        <Flex padding="0px 100px">
          <Text
            fontFamily="Lato"
            fontSize={fontSizeBreakpoints.mainDescription}
            fontWeight="bold"
            textAlign="center"
            maxWidth={{
              base: "100%",
              sm: "600px",
              md: "700px",
              lg: "800px",
              xl: "800px",
            }}
            color="black"
            px={{
              base: "10px",
              sm: "20px",
              md: "30px",
              lg: "20px",
              xl: "20px",
            }}
          >
            {t("consentDeclined.message")}
          </Text>
        </Flex>

        <Flex
          width="100%"
          justify="center"
          mt={{
            base: SIZES[24],
            sm: SIZES[24],
            md: SIZES[24],
            lg: SIZES[24],
            xl: SIZES[24],
          }}
        >
          <Button
            onClick={handleExit}
            variant="solid"
            bg="#F5703D"
            color="black"
            height="auto"
            width="auto"
            px={{
              base: "16px",
              sm: "20px",
              md: "24px",
              lg: "24px",
              xl: "24px",
            }}
            py={{ base: "8px", sm: "10px", md: "12px", lg: "12px", xl: "12px" }}
            borderRadius="8px"
            _hover={{ bg: "#E57053" }}
            _active={{ bg: "#D66046" }}
            leftIcon={
              <Image
                src={ExitIcon}
                width={{
                  base: "16px",
                  sm: "18px",
                  md: "20px",
                  lg: "20px",
                  xl: SIZES[24],
                }}
                height={{
                  base: "16px",
                  sm: "18px",
                  md: "20px",
                  lg: "20px",
                  xl: SIZES[24],
                }}
                alt="Exit"
                filter="brightness(0)"
                mr={{ base: "4px", sm: "6px", md: "8px", lg: "8px", xl: "8px" }}
              />
            }
          >
            <Text
              fontFamily="Lato"
              fontSize={fontSizeBreakpoints.buttonText}
              fontWeight="bold"
            >
              {t("consentDeclined.exitButton")}
            </Text>
          </Button>
        </Flex>
      </VStack>

      {/* <LanguageSelector /> */}
    </Flex>
  );
};

export default ConsentDeclined;
