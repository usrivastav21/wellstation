import {
  PinInput as ChakraPinInput,
  HStack,
  PinInputField,
  VStack,
} from "@chakra-ui/react";
import { FormErrorMessage } from "../design-system";

export const PinInput = ({ ...props }) => {
  const { fontSize, height, width } = props;
  return (
    <VStack rowGap={4} alignItems={{ md: "flex-start", lg: "center" }}>
      <HStack columnGap={4}>
        <ChakraPinInput
          size={"lg"}
          type="numeric"
          mask
          placeholder={null}
          autoComplete="off"
          {...props}
          isInvalid={!!props.error}
          errorBorderColor="error.100"
        >
          {[0, 0, 0, 0, 0, 0].map((slot, idx) => (
            <PinInputField
              autoComplete="off"
              width={
                width ?? {
                  md: 8.5,
                  lg: 16,
                }
              }
              height={
                height ?? {
                  md: 9,
                  lg: 18,
                }
              }
              border="1px"
              borderRadius={8}
              borderColor="gray.200"
              fontSize={
                fontSize ?? {
                  md: "18px",
                  lg: "40px",
                }
              }
              fontWeight={"bold"}
              color={"gray.200"}
              lineHeight="72px"
              textAlign="center"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontFamily={"monospace"}
              _invalid={{
                boxShadow: "error-border-shadow-md",
              }}
              _hover={{
                borderColor: "accent.100",
              }}
              _focus={{
                borderColor: "accent.100",
                boxShadow: "accent-border-shadow-xs",
              }}
              _focusVisible={{
                boxShadow: {
                  md: "accent-border-shadow-sm",
                  lg: "accent-border-shadow-md",
                },
              }}
              key={idx}
            />
          ))}
        </ChakraPinInput>
      </HStack>

      {props.error && (
        <FormErrorMessage>{props.error.message}</FormErrorMessage>
      )}
    </VStack>
  );
};
