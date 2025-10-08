import { mode } from "@chakra-ui/theme-tools";
const buttonStyles = {
  components: {
    Button: {
      baseStyle: {
        borderRadius: "16px",
        fontFamily: "Lato",
        boxSizing: "border-box",
        minHeight: "40px",
        fontSize: "16px",
        _focus: {
          boxShadow: "none",
        },
        _active: {
          boxShadow: "none",
        },
      },
      sizes: {
        sm: {
          fontSize: "14px",
          px: 4,
          py: 2,
        },
        md: {
          fontSize: "16px",
          px: 6,
          py: 3,
        },
        lg: {
          fontSize: "24px",
          px: 8,
          py: 4,
          height: "unset",
        },
        xl: {
          fontSize: "40px",
          px: 12,
          py: 4,
          height: "unset",
        },
        "2xl": {
          fontSize: "64px",
          px: 12,
          py: 6,
          height: "unset",
        },
      },
      variants: {
        outline: () => ({
          borderRadius: "4px",
        }),
        primary: () => ({
          bg: "primary.400",
          color: "text.primary",
          fontWeight: "400",
          _hover: {
            bg: "primary.400",
            _disabled: {
              bg: "primary.400",
            },
          },
        }),
        ghost: () => ({
          bg: "transparent",
          color: "primary.400",
          fontWeight: "400",
          boxShadow: "none",
          _hover: {
            bg: "transparent",
            _disabled: {
              bg: "transparent",
            },
          },
          _focus: {
            bg: "transparent",
          },
          _active: {
            bg: "transparent",
          },
          _focusVisible: {
            bg: "transparent",
          },
        }),
        ["secondary"]: () => ({
          bg: "white",
          color: "primary.200",
          fontWeight: "700",
          border: "0px",
          boxShadow: "none",
        }),
        blackBrand: () => ({
          bg: "black.100",
          color: "white.100",
          p: "8px 24px",
          borderRadius: "4px",
          _hover: {
            bg: "white.100",
            color: "black.100",
            border: "1px solid black",
          },
        }),
        lightBrand: (props) => ({
          bg: mode("#F2EFFF", "whiteAlpha.100")(props),
          color: mode("brand.500", "white")(props),
          _focus: {
            bg: mode("#F2EFFF", "whiteAlpha.100")(props),
          },
          _active: {
            bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          },
          _hover: {
            bg: mode("secondaryGray.400", "whiteAlpha.200")(props),
          },
        }),
        light: (props) => ({
          bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          color: mode("secondaryGray.900", "white")(props),
          _focus: {
            bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          },
          _active: {
            bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          },
          _hover: {
            bg: mode("secondaryGray.400", "whiteAlpha.200")(props),
          },
        }),
        action: (props) => ({
          fontWeight: "500",
          borderRadius: "50px",
          bg: mode("secondaryGray.300", "brand.400")(props),
          color: mode("brand.500", "white")(props),
          _focus: {
            bg: mode("secondaryGray.300", "brand.400")(props),
          },
          _active: { bg: mode("secondaryGray.300", "brand.400")(props) },
          _hover: {
            bg: mode("secondaryGray.200", "brand.400")(props),
          },
        }),
        setup: (props) => ({
          fontWeight: "500",
          borderRadius: "50px",
          bg: mode("transparent", "brand.400")(props),
          border: mode("1px solid", "0px solid")(props),
          borderColor: mode("secondaryGray.400", "transparent")(props),
          color: mode("secondaryGray.900", "white")(props),
          _focus: {
            bg: mode("transparent", "brand.400")(props),
          },
          _active: { bg: mode("transparent", "brand.400")(props) },
          _hover: {
            bg: mode("secondaryGray.100", "brand.400")(props),
          },
        }),
        pause: (props) => ({
          bg: mode("gray.300", "gray.600")(props),
          color: mode("gray.800", "white")(props),
          fontWeight: "400",
          _focus: {
            bg: mode("gray.400", "gray.500")(props),
          },
          _active: {
            bg: mode("gray.400", "gray.500")(props),
          },
          _hover: {
            bg: mode("gray.400", "gray.500")(props),
          },
        }),
      },
    },
  },
};

export default buttonStyles;
