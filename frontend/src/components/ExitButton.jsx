import { Button, Flex, Text } from "@chakra-ui/react";
import ExitIcon from "../assets/exit_black.svg";
import { brandColor } from "../theme/styles";

const ExitButton = ({
  handleClick,
  textFontSize = 32,
  iconDimension = 30,
  text = "Exit",
  displayIcon = true,
}) => {
  return (
    <Flex
      as={Button}
      onClick={handleClick}
      gap={2}
      bg={brandColor}
      color="black"
      _hover={{ bg: "black", color: brandColor }}
      borderRadius="8px"
    >
      {displayIcon && (
        <img
          src={ExitIcon}
          height={iconDimension}
          width={iconDimension}
          alt="Exit"
        />
      )}
      <Text fontSize={textFontSize} fontWeight="bold">
        {text}
      </Text>
    </Flex>
  );
};

export default ExitButton;
