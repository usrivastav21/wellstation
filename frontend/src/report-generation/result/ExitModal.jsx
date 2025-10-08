import { Image, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { ExitWithoutArrowIcon } from "../../assets";
import { Button, Modal } from "../../design-system";

export const ExitModal = ({ isOpen, onClose, onExit }) => {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xs"
      footer={
        <>
          <Button
            fontWeight={"bold"}
            variant="ghost"
            onClick={onClose}
            size="sm"
            fontSize={"xl"}
          >
            Go back
          </Button>
          <Button
            fontWeight={"bold"}
            borderRadius={"md"}
            size="sm"
            variant="primary"
            onClick={onExit}
            fontSize={"xl"}
            display={"flex"}
            columnGap={2}
            color="text.primary"
          >
            <Image src={ExitWithoutArrowIcon} width={5} height={5} />
            {t("general.exit")}
          </Button>
        </>
      }
      content={
        <Text fontSize="xl" fontWeight="bold">
          Your report will not be retrievable after this page closes. Are you
          sure you want to exit?
        </Text>
      }
    ></Modal>
  );
};
