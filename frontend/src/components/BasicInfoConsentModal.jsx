import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { isFullSizeAtom } from "../atoms";
import {
  BUTTON_DIMENSIONS_HALF,
  BUTTON_DIMENSIONS_QUARTER,
  UPDATED_TAB_SIZES,
} from "../atoms/sd";
import { brandColor } from "../theme/styles";

const BasicInfoConsentModal = ({ isOpen, onClose, onConfirm }) => {
  const isFullSize = useAtomValue(isFullSizeAtom);
  const { t, i18n } = useTranslation();
  const isNotEnglish = i18n.language !== "en";

  // const SIZES = isFullSize ? QUARTER_SIZES : HALF_SIZES;
  const SIZES = UPDATED_TAB_SIZES;
  const BUTTON_DIMENSIONS = isFullSize
    ? BUTTON_DIMENSIONS_QUARTER
    : BUTTON_DIMENSIONS_HALF;

  const fontSizes = {
    title: {
      base: "22px",
      sm: "32px",
      md: "24px",
      lg: "24px",
      xl: SIZES[20],
    },
    button: {
      base: "16px",
      sm: "20px",
      md: "24px",
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
          sm: SIZES[360],
        }}
        maxH={{
          base: "90%",
          sm: 240,
        }}
        w="100%"
        h="100%"
        p={{ base: "16px", sm: "16px" }}
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
            mb={{ base: "16px", sm: "28px" }}
          >
            {t("basicInfoConsent.message")}
          </Text>
        </ModalBody>
        <ModalFooter
          p="0"
          gap={{ base: "16px", sm: SIZES[6] }}
          justifyContent="flex-end"
        >
          <Button
            variant="ghost"
            onClick={onClose}
            px={SIZES[12]}
            py={SIZES[4]}
            _hover={{ bg: "transparent" }}
            _active={{ bg: "transparent" }}
          >
            <Text
              color={brandColor}
              fontSize={buttonFontSize}
              fontWeight="bold"
              fontFamily="Lato"
            >
              {t("basicInfoConsent.go")}
            </Text>
          </Button>
          <Button
            bg={brandColor}
            color="brand.100"
            px={SIZES[12]}
            py={SIZES[4]}
            borderRadius={isFullSize ? "6px" : "12px"}
            onClick={onConfirm}
            _hover={{ bg: "#B13100", color: "#fff" }}
            _active={{ bg: "#B13100", color: "#fff" }}
            boxShadow="3px 5px 10px 0px rgba(247,141,100,1)"
          >
            <Text fontSize={buttonFontSize} fontWeight="bold" fontFamily="Lato">
              {t("basicInfoConsent.proceed")}
            </Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

BasicInfoConsentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default BasicInfoConsentModal;
