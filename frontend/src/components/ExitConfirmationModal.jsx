import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { brandColor } from "../theme/styles";
import { useAtomValue } from "jotai";
import { isFullSizeAtom } from "../atoms";
import {
  BUTTON_DIMENSIONS_HALF,
  BUTTON_DIMENSIONS_QUARTER,
  UPDATED_TAB_SIZES,
} from "../atoms/sd";
import { useTranslation } from "react-i18next";
import ExitIcon from "../assets/solar_exit-bold.svg";

const breakPointValues = {
  descriptionFontSize: {
    base: "16px",
    sm: "24px",
    md: "24px",
    lg: "16px",
    xl: "56px",
  },
  modalPadding: {
    base: "8px 6px",
    sm: "16px 24px",
    md: "16px 24px",
    lg: "8px 6px",
    xl: "8px 6px",
  },
  modalGap: { base: "0", sm: "32px", md: "32px", lg: "0", xl: "0" },
  modalBorderRadius: "8px",
};

const ExitConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  const isFullSize = useAtomValue(isFullSizeAtom);
  // const SIZES = isFullSize ? QUARTER_SIZES : HALF_SIZES;
  const SIZES = UPDATED_TAB_SIZES;
  const BUTTON_DIMENSIONS = isFullSize
    ? BUTTON_DIMENSIONS_QUARTER
    : BUTTON_DIMENSIONS_HALF;
  const { t, i18n } = useTranslation();
  const isNotEnglish = i18n.language !== "en";

  const descriptionFontSize = useBreakpointValue(
    breakPointValues.descriptionFontSize
  );
  const modalPadding = useBreakpointValue(breakPointValues.modalPadding);
  const modalGap = useBreakpointValue(breakPointValues.modalGap);

  const fontSizes = {
    title: {
      base: "22px",
      sm: "40px",
      md: "40px",
      lg: "24px",
      xl: SIZES[20],
    },
    button: {
      base: "16px",
      sm: "20px",
      md: "32px",
      lg: "16px",
      xl: SIZES[20],
    },
  };
  const titleFontSize = useBreakpointValue(fontSizes.title);
  const buttonFontSize = useBreakpointValue(fontSizes.button);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        maxW={{
          base: "90%",
          sm: SIZES[340],
        }}
        maxH={{
          base: "90%",
          sm: SIZES[200],
        }}
        w="100%"
        h="100%"
        p={{ base: "16px", sm: "12px" }}
        borderRadius="8px"
        bg="white"
        boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
        border={`2px solid ${brandColor}`}
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <ModalBody
          p="0"
          flex="1"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Text
            fontFamily="Lato"
            fontSize={titleFontSize}
            fontWeight="bold"
            textAlign="center"
            color="#000000"
            lineHeight="normal"
            mb={{ base: "16px", sm: "32px" }}
          >
            {t("exitConfirmation.message")}
          </Text>
        </ModalBody>
        <ModalFooter p="0" gap="32px" justifyContent="flex-end">
          <Button
            variant="ghost"
            height={isNotEnglish ? "auto" : BUTTON_DIMENSIONS.height}
            width={isNotEnglish ? "auto" : BUTTON_DIMENSIONS.width}
            onClick={onClose}
            p="0"
            _hover={{ bg: "transparent" }}
            _active={{ bg: "transparent" }}
          >
            <Text
              color={brandColor}
              fontSize={buttonFontSize}
              fontWeight="bold"
              fontFamily="Lato"
            >
              {t("exitConfirmation.goBack")}
            </Text>
          </Button>
          <Button
            bg={brandColor}
            color="brand.100"
            gap={SIZES[8]}
            px={SIZES[24]}
            py={SIZES[8]}
            borderRadius={SIZES[8]}
            onClick={onConfirm}
            _hover={{ bg: "#B13100", color: "#fff" }}
            _active={{ bg: "#B13100", color: "#fff" }}
            boxShadow="3px 5px 10px 0px rgba(247,141,100,1)"
          >
            <img
              src={ExitIcon}
              height={SIZES[18]}
              width={SIZES[18]}
              alt="Exit"
            />
            <Text fontSize={buttonFontSize} fontWeight="bold" fontFamily="Lato">
              {t("exit")}
            </Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExitConfirmationModal;
