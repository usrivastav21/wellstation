import { Image } from "@chakra-ui/react";
import { AlertDialog } from "./AlertDialog";

export const SuccessAlertDialog = ({ isOpen, onClose, description, icon }) => {
  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <Image
          src={icon}
          w={{
            md: "84px",
            lg: "134px",
          }}
          h={{
            md: "84px",
            lg: "134px",
          }}
        />
      }
      description={description}
      showFooter={false}
    />
  );
};
