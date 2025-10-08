import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import FemaleIcon from "../assets/female.svg";
import MaleIcon from "../assets/male.svg";
import {
  ageAtom,
  isFullSizeAtom,
  paddedWidthAtom,
  selectedGenderAtom,
  stepAtom,
  reportIdAtom,
} from "../atoms";
import {
  BUTTON_DIMENSIONS_HALF,
  BUTTON_DIMENSIONS_QUARTER,
  UPDATED_TAB_SIZES,
} from "../atoms/sd";
import BasicInfoConsentModal from "../components/BasicInfoConsentModal";
import LanguageSelector from "../components/LanguageSelector";
import RedCircleText from "../components/RedCircleText";
import { brandColor } from "../theme/styles";
import { generateReportId } from "../utils/generateUserId";

const GenderOption = ({
  id,
  label,
  icon,
  isSelected,
  onSelect,
  logoWidth,
  logoHeight,
  genderTextSize,
}) => (
  <VStack
    spacing={2}
    cursor="pointer"
    onClick={() => onSelect(id)}
    opacity={1}
    borderRadius="8px"
    px="12px"
    py="8px"
    border={isSelected ? "2px solid #3D50F5" : "none"}
  >
    <Box>
      <img
        src={icon}
        alt={label}
        style={{
          color: "black",
          width: logoWidth,
          height: logoHeight,
          objectFit: "fill",
        }}
      />
    </Box>
    <Text fontSize={genderTextSize} fontWeight="semibold">
      {label}
    </Text>
  </VStack>
);

const AGE_RANGES = [
  "Less than 18",
  "18 - 25",
  "26 - 35",
  "36 - 45",
  "46 - 55",
  "56 - 65",
  "More than 65",
];

const AgeDropdown = ({ value, onChange, SIZES }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isInTamil = currentLanguage === "tamil";

  const AgeDropdownOptions = t(`basicInfo.ageSection.options`, {
    returnObjects: true,
  });

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={
          <Box
            bg="#F5703D"
            p="2px"
            borderRadius="4px"
            display="flex"
            alignItems="center"
          >
            <ChevronDownIcon
              color="white"
              boxSize={{ base: "20px", md: "24px", xl: SIZES[34] }}
              fontSize={{ base: 22, md: 26, xl: SIZES[34] }}
            />
          </Box>
        }
        // width={{
        //   base: isInTamil ? "auto" : SIZES[300],
        //   sm: isInTamil ? "auto" : SIZES[350],
        //   md: isInTamil ? "auto" : SIZES[400],
        //   xl: isInTamil ? "auto" : SIZES[600],
        // }}
        width="auto"
        bg="white"
        border="2px solid"
        borderColor="#000000"
        borderRadius="8px"
        textAlign="left"
        _hover={{ bg: "white" }}
        _active={{
          bg: "white",
          borderColor: "#3D50F5",
        }}
        _expanded={{
          borderColor: "#3D50F5",
          bg: "white",
        }}
        minHeight={SIZES[96]}
        fontSize={{ base: "1.4rem" }}
        fontWeight="semibold"
        fontFamily="Lato"
        color={value ? "#000000" : "#718096"}
        pl="16px"
        pr="1px"
        pt="2px"
        pb="2px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        {value || t("basicInfo.ageSection.placeholder")}
      </MenuButton>
      <MenuList
        border="2px solid"
        borderColor="#000000"
        borderRadius="8px"
        p="0"
        mt="4px"
        width={{ base: "300px", sm: "350px", md: "400px", xl: "280px" }}
        bg="white"
      >
        {AgeDropdownOptions.map((range) => (
          <MenuItem
            key={range.text}
            onClick={() => onChange(range.value)}
            bg={value === range ? "#7B7A79" : "white"}
            color={value === range ? "#FFFFFF" : "#000000"}
            _hover={{
              bg: "#7B7A79",
              color: "#FFFFFF",
            }}
            _active={{
              bg: "#7B7A79",
              color: "#FFFFFF",
            }}
            _focus={{
              bg: "#7B7A79",
              color: "#FFFFFF",
            }}
            height="30px"
            fontSize="16px"
            fontWeight="semibold"
            fontFamily="Lato"
            px="16px"
          >
            {range.text}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

const InstructionItem = ({
  number,
  text,
  fontSize,
  redCircleDiameter,
  redCircleFontSize,
}) => (
  <Flex gap={4} align="flex-start" justify="center" alignItems="center">
    <RedCircleText
      height={redCircleDiameter}
      width={redCircleDiameter}
      textComponent={
        <Text
          fontSize={redCircleFontSize}
          fontWeight="extrabold"
          fontFamily="Lato"
          as="em"
        >
          {number}
        </Text>
      }
    />
    <Flex align="center" flex={1} height="100%">
      <Text
        fontSize={fontSize}
        fontWeight="regular"
        fontFamily="Lexend"
        textAlign="left"
      >
        {text}
      </Text>
    </Flex>
  </Flex>
);

const BasicInfo = () => {
  const setStep = useSetAtom(stepAtom);
  const setReportId = useSetAtom(reportIdAtom);
  const paddedWidth = useAtomValue(paddedWidthAtom);
  const isFullSize = useAtomValue(isFullSizeAtom);
  // const SIZES = isFullSize ? QUARTER_SIZES : HALF_SIZES;
  const SIZES = UPDATED_TAB_SIZES;
  const BUTTON_DIMENSIONS = isFullSize
    ? BUTTON_DIMENSIONS_QUARTER
    : BUTTON_DIMENSIONS_HALF;

  const [selectedGender, setSelectedGender] = useAtom(selectedGenderAtom);
  const [age, setAge] = useAtom(ageAtom);

  const { t, i18n } = useTranslation();
  const isInTamil = i18n.language === "tamil";
  const isFormValid = useMemo(
    () => selectedGender && age && age !== "Select age range",
    [selectedGender, age]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const moveToFacialAnalysis = () => {
    setReportId(generateReportId());
    setStep("facialAnalysis");
  };

  const breakPointValues = {
    redCircleSize: {
      diameter: {
        base: "30px",
        sm: "40px",
        md: "80px",
        lg: "30px",
        xl: SIZES[54],
      },
    },
  };

  const genderLogoSize = {
    width: { base: "72px", sm: "72px", md: "68px", lg: "72px", xl: SIZES[49] },
    height: { base: "72px", sm: "72px", md: "72px", lg: "72px", xl: SIZES[52] },
    textSize: {
      base: "24px",
      sm: "24px",
      md: "24px",
      lg: "24px",
      xl: SIZES[20],
    },
  };

  const fontSizes = {
    mainDescription: {
      base: "16px",
      sm: "20px",
      md: "32px",
      lg: "20px",
      xl: SIZES[24],
    },
    instructions: {
      base: "12px",
      sm: "14px",
      md: "24px",
      lg: "16px",
      xl: SIZES[16],
    },
    circleTextSize: {
      base: "12px",
      sm: "14px",
      md: "47px",
      lg: "16px",
      xl: SIZES[24],
    },
  };

  const mainDescriptionFontSize = useBreakpointValue(fontSizes.mainDescription);
  const instructionsFontSize = useBreakpointValue(fontSizes.instructions);
  const genderLogoWidth = useBreakpointValue(genderLogoSize.width);
  const genderLogoHeight = useBreakpointValue(genderLogoSize.height);
  const genderTextSize = useBreakpointValue(genderLogoSize.textSize);
  const redCircleDiameter = useBreakpointValue(
    breakPointValues.redCircleSize.diameter
  );
  const redCircleFontSize = useBreakpointValue(fontSizes.circleTextSize);

  const handleStartScanning = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const confirmExit = () => {
    moveToFacialAnalysis();
    setIsModalOpen(false);
  };

  const GENDER_OPTIONS = [
    {
      id: "male",
      label: t("basicInfo.genderSection.male"),
      icon: MaleIcon,
    },
    {
      id: "female",
      label: t("basicInfo.genderSection.female"),
      icon: FemaleIcon,
    },
  ];

  const isNotEnglish = i18n.language !== "en";
  return (
    <Flex
      flexDirection="column"
      width="100%"
      height="100%"
      p={1}
      overflowY="scroll"
      css={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
        scrollbarWidth: "none",
        "-ms-overflow-style": "none",
      }}
      position="relative"
      padding="0px 180px"
    >
      <VStack
        width={paddedWidth}
        margin="auto"
        height="100%"
        align="flex-start"
        overflowY="scroll"
        flex={1}
      >
        <LanguageSelector />

        <Text
          fontSize={mainDescriptionFontSize}
          fontFamily="Lato"
          fontWeight="bold"
          mb="0px"
          mt="40px"
        >
          {t("basicInfo.mainDescription")}
        </Text>

        <Flex width="100%" flexDirection="column" gap={1}>
          <Flex spacing={1} align="center">
            <Flex flex={1}>
              <Text
                fontSize={mainDescriptionFontSize}
                fontFamily="Lato"
                fontWeight="bold"
              >
                {`${t("basicInfo.genderSection.gender")}*:`}
              </Text>
            </Flex>
            <Flex
              flex={4}
              gap={{
                base: "26px",
                sm: "80px",
                md: "80px",
                lg: "80px",
                xl: "80px",
              }}
              justify="flex-start"
              pl={{ base: "26px", sm: "40px", md: "80px" }}
            >
              {GENDER_OPTIONS.map((option) => (
                <GenderOption
                  key={option.id}
                  {...option}
                  isSelected={selectedGender === option.id}
                  onSelect={setSelectedGender}
                  logoWidth={genderLogoWidth}
                  logoHeight={genderLogoHeight}
                  genderTextSize={genderTextSize}
                />
              ))}
            </Flex>
          </Flex>

          <Flex spacing={4} align="flex-start">
            <Flex flex={1}>
              <Text
                fontSize={mainDescriptionFontSize}
                fontFamily="Lato"
                fontWeight="bold"
              >
                {`${t("basicInfo.ageSection.age")}*:`}
              </Text>
            </Flex>
            <Flex
              flex={4}
              justify="flex-start"
              pl={{ base: "26px", sm: "40px", md: "80px" }}
            >
              <AgeDropdown value={age} onChange={setAge} SIZES={SIZES} />
            </Flex>
          </Flex>

          <VStack spacing={6} align="flex-start" alignItems="left" width="100%">
            <Text
              fontSize={mainDescriptionFontSize}
              fontFamily="Lato"
              fontWeight="bold"
              width="100%"
              textAlign="left"
            >
              {t("basicInfo.instructionsTitle")}
            </Text>
            <VStack spacing="24px" width="100%" align="flex-start">
              <InstructionItem
                number="1"
                text={t("basicInfo.instructions.0")}
                fontSize={instructionsFontSize}
                redCircleDiameter={redCircleDiameter}
                redCircleFontSize={redCircleFontSize}
              />
              <InstructionItem
                number="2"
                text={t("basicInfo.instructions.1")}
                fontSize={instructionsFontSize}
                redCircleDiameter={redCircleDiameter}
                redCircleFontSize={redCircleFontSize}
              />
              <InstructionItem
                number="3"
                text={t("basicInfo.instructions.2")}
                fontSize={instructionsFontSize}
                redCircleDiameter={redCircleDiameter}
                redCircleFontSize={redCircleFontSize}
              />
            </VStack>
          </VStack>
        </Flex>

        <Flex
          width="100%"
          justify="center"
          mt={{ base: "16px", sm: "54px", md: "54px", lg: "16px", xl: "5px" }}
          mb={{
            base: "48px",
            sm: "105px",
            md: "105px",
            lg: "48px",
            xl: "0px",
          }}
        >
          <Button
            onClick={handleStartScanning}
            variant="brand"
            bg={brandColor}
            color="brand.100"
            height={isNotEnglish ? "auto" : BUTTON_DIMENSIONS.height}
            width={isNotEnglish ? "auto" : BUTTON_DIMENSIONS.width}
            px={isFullSize ? "12px" : "24px"}
            py={isFullSize ? "12px" : "24px"}
            borderRadius={isFullSize ? "6px" : "12px"}
            _hover={{ bg: "#B13100", color: "#fff" }}
            _active={{ bg: "#B13100", color: "#fff" }}
            boxShadow=" 3px 5px 10px 0px rgba(247,141,100,1)"
            isDisabled={!isFormValid}
            opacity={isFormValid ? 1 : 0.5}
            cursor={isFormValid ? "pointer" : "not-allowed"}
          >
            <Text
              fontFamily="Lato"
              fontSize={mainDescriptionFontSize}
              fontWeight="bold"
            >
              {t("basicInfo.startScanning")}
            </Text>
          </Button>
        </Flex>

        <BasicInfoConsentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmExit}
        />
      </VStack>
    </Flex>
  );
};

export default BasicInfo;
