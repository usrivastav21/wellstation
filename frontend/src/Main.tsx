import { ChakraProvider } from "@chakra-ui/react";
import { Suspense } from "react";
import ReactDOM from "react-dom/client";

import App from "./App.js";
import LoadingSpinnerAnimation from "./components/LoadingSpinnerAnimation.jsx";
import "./i18next/index.js";
import "./index.css";
import theme from "./theme/theme.js";

const Root = () => {
  return (
    <Suspense fallback={<LoadingSpinnerAnimation />}>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </Suspense>
  );
};

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement as HTMLElement);

root.render(<Root />);
