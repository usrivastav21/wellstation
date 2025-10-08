import { forwardRef } from "react";

import { Input } from "@chakra-ui/react";

export const TextInput = forwardRef(
  ({ placeholder, fontSize, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        autoComplete="off"
        height={{ md: 8.5, lg: 14 }}
        borderRadius={8}
        placeholder={placeholder}
        borderColor="gray.200"
        fontSize={
          fontSize ?? {
            md: "1rem",
            lg: "1.2rem",
          }
        }
        _placeholder={{
          color: "text.disabled",
          fontSize: fontSize ?? {
            md: "1rem",
            lg: "1.2rem",
          },
          fontFamily: "Lexend",
          lineHeight: "normal",
        }}
        _hover={{
          borderColor: "accent.100",
        }}
        _focus={{
          borderColor: "accent.100",
          boxShadow: "0 0 0 1px var(--chakra-colors-accent-100)",
        }}
        _focusVisible={{
          boxShadow: "0 0 0 4px var(--chakra-colors-accent-100)",
        }}
        isInvalid={!!props.error}
        _invalid={{
          boxShadow: "0 0 0 4px var(--chakra-colors-error-100)",
        }}
        errorBorderColor="error.100"
        {...props}
      />
    );
  }
);

TextInput.displayName = "TextInput";
