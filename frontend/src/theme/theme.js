import { theme as baseTheme, extendTheme } from "@chakra-ui/react";
import { breakpoints } from "./breakpoints";
import buttonStyles from "./components/button";
import textStyles from "./components/text";
import customShadows from "./shadows";
import { spacing } from "./spacing";
import { globalStyles } from "./styles";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  colors: globalStyles.colors,
  ...globalStyles,
  space: {
    ...baseTheme.space,
    ...spacing,
  },
  radii: {
    ...baseTheme.radii,
    ...{
      "4xl": "2rem",
    },
  },
  sizes: {
    ...baseTheme.sizes,
    container: {
      xs: "512px",
      ...baseTheme.sizes.container,
    },
    ...spacing,
  },
  shadows: {
    ...baseTheme.shadows,
    ...customShadows,
  },
  breakpoints,
  components: {
    ...textStyles.components,
    ...buttonStyles.components,
  },
});

export default theme;
