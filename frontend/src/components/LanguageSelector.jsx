import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { isFullSizeAtom } from "../atoms";
import { brandColor } from "../theme/styles";
import { QUARTER_SIZES, HALF_SIZES } from "../atoms/sd";

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isFullSize = useAtomValue(isFullSizeAtom);
  const SIZES = isFullSize ? QUARTER_SIZES : HALF_SIZES;

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const currentLang = i18n.language;
    // console.log("Initial language:", currentLang);
    const languageMap = {
      eng: "English",
      zh: "中文",
      bahasa: "Bahasa Melayu",
      tamil: "தமிழ்",
    };
    return languageMap[currentLang] || "English";
  });

  // useEffect(() => {
  //   console.log("Current i18n language:", i18n.language);
  //   console.log("Selected display language:", selectedLanguage);
  // }, [i18n.language, selectedLanguage]);

  const languages = ["English", "中文", "Bahasa Melayu", "தமிழ்"];

  const languageCodes = {
    English: "eng",
    中文: "zh",
    "Bahasa Melayu": "bahasa",
    தமிழ்: "tamil",
  };

  const handleLanguageSelect = async (language) => {
    const langCode = languageCodes[language];
    console.log("Attempting to change language to:", langCode);

    try {
      // Change language first
      await i18n.changeLanguage(langCode);

      // Then update selected language
      setSelectedLanguage(language);

      // Verify translation is working
      // console.log("Translation test after change:", {
      //   language: i18n.language,
      //   mainHeader: t("consentScreen.mainHeader"),
      //   currentResources: i18n.store.data[langCode],
      // });
    } catch (error) {
      console.error("Error changing language:", error);
    }
    setIsOpen(false);
  };

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log("Language changed, current translations:", {
        language: i18n.language,
        mainHeader: t("consentScreen.mainHeader"),
      });
    };

    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n, t]);

  return (
    <>
      <Box
        position="fixed"
        bottom="20px"
        right="90px"
        zIndex={1000}
        onClick={() => setIsOpen(true)}
      >
        <Flex position="relative">
          <Flex
            bg="#F5703D"
            w="48px"
            h="48px"
            borderRadius="16px"
            alignItems="center"
            justifyContent="center"
            position="absolute"
            top="0"
            left="0"
            zIndex={2}
            boxShadow="0px 4px 8px rgba(244, 133, 107, 0.3)"
          >
            <Text color="black" fontSize="20px" fontWeight="bold">
              文A
            </Text>
          </Flex>

          <Flex
            bg="white"
            borderRadius="20px"
            direction="column"
            border="3px solid #F5703D"
            pt="8px"
            pb="8px"
            gap="3px"
            alignItems="center"
            mt="22px"
            ml="24px"
            minWidth="130px"
            boxShadow="0px 4px 8px rgba(244, 133, 107, 0.3)"
          >
            <Text fontSize="14px" color="#232211" fontWeight="600">
              English
            </Text>
            <Text fontSize="14px" color="#232211" fontWeight="600">
              中文
            </Text>
            <Text fontSize="14px" color="#232211" fontWeight="600">
              Bahasa Melayu
            </Text>
            <Text fontSize="14px" color="#232211" fontWeight="600">
              தமிழ்
            </Text>
          </Flex>
        </Flex>
      </Box>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
        <ModalContent
          maxW={{ base: "90%", sm: SIZES[950] }}
          maxH={{ base: "90%", sm: SIZES[750] }}
          w="100%"
          h="100%"
          // p={SIZES[32]}
          bg="white"
          boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
          border={`2px solid ${brandColor}`}
          borderRadius="8px"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          mx="20px"
          overflow="hidden"
        >
          <Flex direction="column" w="full" h="full">
            {languages.map((language, index) => (
              <Text
                key={language}
                fontSize={SIZES[80]}
                color={selectedLanguage === language ? "white" : "#23211F"}
                fontWeight="bold"
                fontFamily="Lato"
                textAlign="center"
                cursor="pointer"
                bg={selectedLanguage === language ? "#F5703D" : "white"}
                h={SIZES[144]}
                display="flex"
                alignItems="center"
                justifyContent="center"
                onClick={() => handleLanguageSelect(language)}
                transition="all 0.2s"
                _hover={{
                  bg:
                    selectedLanguage === language
                      ? "#F5703D"
                      : "rgba(245, 112, 61, 0.1)",
                }}
              >
                {language}
              </Text>
            ))}
          </Flex>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LanguageSelector;
