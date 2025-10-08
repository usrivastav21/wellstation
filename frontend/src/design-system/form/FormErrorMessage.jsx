import { FormErrorMessage as ChakraFormErrorMessage } from "@chakra-ui/react";

export const FormErrorMessage = ({ children, ...props }) => {
  return (
    <ChakraFormErrorMessage
      color="error.100"
      fontSize={{
        md: "1rem",
        lg: "1.15rem",
      }}
      fontWeight={"bold"}
      m={0}
      {...props}
    >
      {children}
    </ChakraFormErrorMessage>
  );
};
