import {
  Modal as ChakraModal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

export const Modal = ({
  isOpen,
  onClose,
  footer,
  content,
  header,
  ...props
}) => {
  return (
    <ChakraModal isOpen={isOpen} onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent p={4} rowGap={6} borderRadius={"lg"}>
        {header && <ModalHeader p={0}>{header}</ModalHeader>}
        {content && <ModalBody p={0}>{content}</ModalBody>}
        {footer && (
          <ModalFooter
            display={"flex"}
            justifyContent={"flex-end"}
            gap={2}
            p={0}
          >
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </ChakraModal>
  );
};
