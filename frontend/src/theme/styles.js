import { theme as chakraTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import merge from "lodash.merge";

const customColors = {
  primary: {
    50: "#FEF2F0",
    100: "#FDE6E0",
    200: "#FBD0C7",
    300: "#F8B3A3",
    400: "#F5703D", // Your primary color
    500: "#E55A2B",
    600: "#D1451A",
    700: "#B03A15",
    800: "#8E2F11",
    900: "#74260E",
  },
  secondaryGray: {
    100: "#E0E5F2",
    200: "#E1E9F8",
    300: "#F4F7FE",
    400: "#E9EDF7",
    500: "#8F9BBA",
    600: "#A3AED0",
    700: "#707EAE",
    800: "#707EAE",
    900: "#1B2559",
  },
  red: {
    100: "#FEEFEE",
    500: "#EE5D50",
    600: "#E31A1A",
  },
  blue: {
    50: "#EFF4FB",
    100: "#E1EAFA",
    200: "#C3D5F8",
    300: "#0EA5E9",
    400: "#6B93F0",
    500: "#3965FF",
    600: "#2E51CC",
    700: "#233D99",
    800: "#172966",
    900: "#0C1433",
  },
  skyBlue: {
    50: "#F0F9FF",
    100: "#E0F4FF",
    200: "#BAE6FF",
    300: "#7DD3FC",
    400: "#38BDF8",
    500: "#0EA5E9",
    600: "#0284C7",
    700: "#0369A1",
    800: "#075985",
    900: "#0C4A6E",
  },
  orange: {
    100: "#FFF6DA",
    500: "#FFE0BB",
    900: "#FFB547",
  },
  green: {
    100: "#E6FAF5",
    500: "#01B574",
  },
  navy: {
    50: "#d0dcfb",
    100: "#aac0fe",
    200: "#a3b9f8",
    300: "#728fea",
    400: "#3652ba",
    500: "#1b3bbb",
    600: "#24388a",
    700: "#1B254B",
    800: "#111c44",
    900: "#0b1437",
  },
  brandGrey: {
    100: "#EAEAEA",
    500: "#FAFAFB",
    900: "#F3F3F3",
  },
  black: {
    100: "#000000",
    500: "#121212",
  },
  gray: {
    100: "#807E7E",
    200: "#7B7A79",
  },
  text: {
    primary: "#23211F",
    disabled: "#A7A6A5",
  },
  accent: {
    100: "#3D50F5",
  },
  error: {
    100: "#F53D67",
  },
  shadow: {
    100: "#F78D6466",
  },
};

// Deep merge Chakra's colors with customColors
const colors = merge({}, chakraTheme.colors, customColors);

// Debug: Log the colors to see what's available
console.log("Available colors:", Object.keys(colors));
console.log("Primary color:", colors.primary);
console.log("Blue color (for comparison):", colors.blue);
console.log("Is primary in colors?", "primary" in colors);
console.log("Is blue in colors?", "blue" in colors);

export const globalStyles = {
  colors,
  styles: {
    global: (props) => ({
      body: {
        colorScheme: "light",
        // overflowX: "hidden",
        bg: mode("white.100", "secondaryGray.300")(props),
        color: mode("black.100", "black.100")(props),
        letterSpacing: "-0.5px",
        fontFamily: "Lato",
      },
      input: {
        color: "gray.700",
        fontFamily: "Lato",
      },
      html: {
        fontFamily: "Lato",
        colorScheme: "light",
      },
    }),
  },
};

export const brandColor = "#F5703D";
