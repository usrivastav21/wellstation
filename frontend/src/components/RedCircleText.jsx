import { Flex } from "@chakra-ui/react";

const RedCircleText = ({
  text,
  width = "144px",
  height = "144px",
  textComponent,
}) => {
  return (
    <Flex
      width={width}
      height={height}
      borderRadius="full"
      bg="#FF4D75"
      color="white"
      justify="center"
      align="center"
      fontSize="xl"
      fontWeight="bold"
    >
      {text ? <i>{text}</i> : textComponent}
    </Flex>
  );
};

export default RedCircleText;
