import {
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialog as ChakraAlertDialog,
  Text,
} from "@chakra-ui/react";
import { Button } from "../button";

export const AlertDialog = ({
  title,
  description,
  onClose,
  isOpen,
  onConfirm,
  isDisabled,
  isLoading,
  showFooter = true,
}) => {
  return (
    <ChakraAlertDialog
      size={{
        base: "md",
        sm: "sm",
        md: "md",
        lg: "lg",
      }}
      isCentered
      isOpen={isOpen}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent
          p={{
            md: 4,
            lg: 8,
          }}
          // minW={694}
          borderRadius={32}
          boxShadow="0px 0px 0px 4px var(--chakra-colors-primary-400), 8px 12px 20px 0px var(--chakra-colors-shadow-100)"
        >
          {title && (
            <AlertDialogHeader
              display={"flex"}
              justifyContent={"center"}
              pb={{
                md: 8,
                lg: 12,
              }}
              pt={0}
              px={0}
            >
              {title}
            </AlertDialogHeader>
          )}

          <AlertDialogBody p={0}>
            <Text
              fontSize={{
                md: "28px",
                lg: "48px",
              }}
              fontWeight={700}
              textAlign={"center"}
            >
              {description}
            </Text>
          </AlertDialogBody>

          {showFooter ? (
            <AlertDialogFooter
              px={0}
              pb={0}
              pt={{
                md: 8,
                lg: 12,
              }}
            >
              <Button
                size={{
                  base: "md",
                  sm: "md",
                  md: "lg",
                  lg: "xl",
                }}
                variant="secondary"
                onClick={onClose}
                isDisabled={isLoading || isDisabled}
              >
                Cancel
              </Button>
              <Button
                size={{
                  base: "md",
                  sm: "md",
                  md: "lg",
                  lg: "xl",
                }}
                ml={3}
                variant="primary"
                onClick={onConfirm}
                isDisabled={isLoading || isDisabled}
                isLoading={isLoading}
              >
                Confirm
              </Button>
            </AlertDialogFooter>
          ) : null}
        </AlertDialogContent>
      </AlertDialogOverlay>
    </ChakraAlertDialog>
  );
};
