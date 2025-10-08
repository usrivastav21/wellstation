import {
  Box,
  Button,
  Flex,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { UPDATED_TAB_SIZES } from "../../atoms/sd";
import { brandColor } from "../../theme/styles";

const LowVolume = ({ isOpen = true, onClose }) => {
  const { t } = useTranslation();
  const warningPng =
    "https://w3assets.blob.core.windows.net/public/popup_warning.png";

  const SIZES = UPDATED_TAB_SIZES;

  return (
    <>
      <Modal isOpen={isOpen}>
        <ModalOverlay />

        <ModalContent
          p={SIZES[40]}
          borderRadius={SIZES[16]}
          border="4px solid #F5703D"
        >
          <Flex
            width="100%"
            flexDirection="column"
            justify="center"
            alignItems={"center"}
            gap={SIZES[36]}
          >
            <Image
              src={warningPng}
              width={SIZES[80]}
              height={SIZES[70]}
              objectFit="contain"
            />
            <Box width="100%" textAlign="center">
              <Text fontFamily="Lato" fontWeight="bold" fontSize={SIZES[28]}>
                {t("sound-analysis.low-volume-1")}
              </Text>
              <Text fontFamily="Lato" fontWeight="bold" fontSize={SIZES[28]}>
                {t("sound-analysis.low-volume-2")}
              </Text>
            </Box>
            <Flex>
              <Button
                bg={brandColor}
                color="brand.100"
                px={SIZES[32]}
                py={SIZES[16]}
                borderRadius={"12px"}
                onClick={onClose}
                _hover={{ bg: "#B13100", color: "#fff" }}
                _active={{ bg: "#B13100", color: "#fff" }}
                boxShadow="3px 5px 10px 0px rgba(247,141,100,1)"
              >
                <Text fontSize={SIZES[24]} fontWeight="bold" fontFamily="Lato">
                  {t("general.dismiss")}
                </Text>
              </Button>
            </Flex>
          </Flex>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LowVolume;
