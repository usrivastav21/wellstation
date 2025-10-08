import { Box, useRadio, VStack } from "@chakra-ui/react";

export const RadioGenderCard = (props) => {
  const { getInputProps, getRadioProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as="label">
      <input {...input} />
      <VStack
        {...checkbox}
        cursor="pointer"
        borderRadius="md"
        _checked={{
          boxShadow: "accent-border-shadow-md",
        }}
        _focusVisible={{
          boxShadow: "outline",
        }}
        width={{
          md: "108px",
          lg: "144px",
        }}
        height={{
          md: "120px",
          lg: "160px",
        }}
        userSelect={"none"}
      >
        {props.children}
      </VStack>
    </Box>
  );
};
