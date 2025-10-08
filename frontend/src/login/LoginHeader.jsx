import { Heading, Image, VStack } from "@chakra-ui/react";
import lockImage from "../assets/lock.png";

export const LoginHeader = ({ title, image }) => {
  return (
    <VStack alignItems={"center"} rowGap={{ md: 1, lg: 2 }}>
      <Image
        src={image || lockImage}
        alt="logo"
        width={{ base: "48px", lg: "78px" }}
        height={{ base: "48px", lg: "84px" }}
      />
      <Heading
        as="h1"
        fontSize={{ base: "20px", md: "28px", lg: "48px" }}
        fontWeight={"extrabold"}
      >
        {title}
      </Heading>
    </VStack>
  );
};
