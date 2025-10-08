import { Box } from "@chakra-ui/react";

export const LoginLayout = ({ children }) => {
  return (
    <Box
      width={"100dvw"}
      height={"100dvh"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Box
        display={"flex"}
        flexDirection={"column"}
        justifyContent="center"
        alignItems="center"
        bg="white"
        position={"relative"}
        padding={{ md: 4, lg: 8 }}
        border="4px"
        borderColor={"primary.400"}
        width={{ base: "100%", sm: "60%", md: "50%", lg: "696px" }}
        maxWidth={{ md: "364px", lg: "696px" }}
        maxHeight={{ md: "364px", lg: "764px" }}
        borderRadius={32}
        rowGap={{ md: 6, lg: 12 }}
        boxShadow={"8px 12px 20px 0px #F78D6466"}
      >
        {children}
      </Box>
    </Box>
  );
};
