import {
  Button,
  createTheme,
  MantineProvider,
  rem,
  Text,
  Title,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "react-error-boundary";
import { HashRouter, Navigate, Route, Routes } from "react-router";

import classes from "./App.module.css";
import { Error } from "./error";
import Layout from "./Layout";
import {
  AdminLogin,
  Login,
  ChangePin,
  ResetPin,
  ResetPinSuccess,
  UserLogin,
} from "./login";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { Registration } from "./registration";
import { ReportGenerationFlow } from "./report-generation";
import { Resources } from "./resources/Resources";

// 1 minute
const STALE_TIME = 1000 * 60 * 1;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: STALE_TIME,
    },
  },
});

const theme = createTheme({
  components: {
    Button: Button.extend({
      vars: (theme, props) => {
        if (props.size === "xxl") {
          return {
            root: {
              "--button-height": rem(80),
              "--button-fz": "var(--mantine-font-size-4xl)",
            },
          };
        }

        return { root: {} };
      },
      classNames: classes,
    }),
    Text: Text.extend({
      defaultProps: {
        c: "var(--mantine-color-text-9)",
        ff: "Lexend",
      },
    }),
    Title: Title.extend({
      defaultProps: {
        c: "var(--mantine-color-text-9)",
      },
    }),
  },
  fontFamily: "Lato",
  headings: {
    fontFamily: "Lato",
  },
  fontSizes: {
    lg: rem(24),
    xl: rem(28),
    "2xl": rem(32),
    "3xl": rem(40),
    "4xl": rem(48),
  },
  colors: {
    brand: [
      "#ffeee4",
      "#ffdccd",
      "#ffb79b",
      "#fe8e62",
      "#fd6f38",
      "#fd5a1b",
      "#fd4f0b",
      "#e24000",
      "#ca3700",
      "#b12b00",
    ],
    brandDark: [
      "#ffeee3",
      "#ffdccc",
      "#ffb79b",
      "#fe9065",
      "#fd6f37",
      "#fd6023",
      "#fd4e09",
      "#e23f00",
      "#ca3600",
      "#b12a00",
    ],
    text: [
      "#f5f5f4",
      "#e7e7e7",
      "#cecece",
      "#b2b2b2",
      "#9b9b9b",
      "#8d8d8d",
      "#858585",
      "#737271",
      "#686563",
      "#23211f",
    ],
  },
  primaryColor: "brand",
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <ReactQueryDevtools initialIsOpen={false} />
        {process.env.NODE_ENV === 'development' && (
          // DevTools conditionally imported only in development
          (() => {
            try {
              const { DevTools } = require('jotai-devtools');
              return <DevTools />;
            } catch (e) {
              // Gracefully handle if jotai-devtools is not available
              return null;
            }
          })()
        )}
        <HashRouter>
          <Layout>
            <ErrorBoundary fallback={<Error />}>
              <Routes>
                <Route
                  path="/booth"
                  element={
                    <ProtectedRoute>
                      <ReportGenerationFlow />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-login"
                  element={
                    <PublicRoute>
                      <AdminLogin />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/auth"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/auth/login"
                  element={
                    <PublicRoute>
                      <UserLogin />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/registration"
                  element={
                    <PublicRoute>
                      <Registration />
                    </PublicRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/admin-login" />} />
                <Route
                  path="/reset-pin"
                  element={
                    <PublicRoute>
                      <ResetPin />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/reset-pin/success"
                  element={<ResetPinSuccess />}
                />
                <Route
                  path="/change-pin"
                  element={
                    <ProtectedRoute>
                      <ChangePin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resources"
                  element={
                    <ProtectedRoute>
                      <Resources />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </ErrorBoundary>
          </Layout>
        </HashRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
