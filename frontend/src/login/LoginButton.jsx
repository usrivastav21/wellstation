import { Button } from "../design-system";

const LoginButton = ({ children, isPending, ...props }) => {
  return (
    <Button
      w={"100%"}
      py={4}
      px={12}
      variant={"primary"}
      type="submit"
      size={{
        md: "lg",
        lg: "xl",
      }}
      borderRadius={{
        base: "var(--chakra-radii-lg)",
        lg: "var(--chakra-radii-2xl)",
      }}
      mt={{ md: 6, lg: 12 }}
      h={{ base: 9, sm: 8, md: 10, lg: 18 }}
      isLoading={isPending}
      isDisabled={isPending}
      boxShadow={{
        md: "primary-border-shadow-sm",
        lg: "primary-border-shadow-md",
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default LoginButton;
