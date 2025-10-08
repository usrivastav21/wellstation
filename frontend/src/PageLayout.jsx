import { Box } from "@chakra-ui/react";

export const PageLayout = ({ children, ...props }) => {
  return (
    <Box px={12} py={4} {...props}>
      {children}
    </Box>
  );
};
