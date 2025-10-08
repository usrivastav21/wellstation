import { Button as ChakraButton } from "@chakra-ui/react";

export const Button = ({ isPending, isDisabled, children, ...props }) => {
  return (
    <ChakraButton
      isLoading={isPending}
      isDisabled={isPending || isDisabled}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};
