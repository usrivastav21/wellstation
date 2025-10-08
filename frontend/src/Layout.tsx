import { Box, Container } from "@mantine/core";

import { Header } from "./navigation/Header";
import { useBackendPort } from "./utils";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  // TODO: these hooks should be in the app
  // useIdleTimeout();
  useBackendPort();

  return (
    <Container size={1680} pb={32}>
      <Header />
      <Box h={904}>{children}</Box>
    </Container>
  );
};

export default Layout;
