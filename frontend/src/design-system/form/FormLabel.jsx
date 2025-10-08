import { FormLabel as ChakraFormLabel } from "@chakra-ui/react";

export const FormLabel = ({ children, ...props }) => {
  return (
    <ChakraFormLabel
      mb={{ md: 0.5, lg: 2 }}
      fontSize={{
        md: "20px",
        lg: "40px",
      }}
      fontWeight={"bold"}
      {...props}
    >
      {children}
    </ChakraFormLabel>
  );
};
