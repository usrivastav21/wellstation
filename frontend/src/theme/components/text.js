const textStyles = {
  components: {
    Heading: {
      baseStyle: {
        fontFamily: "Lato",
      },
    },
    Text: {
      baseStyle: {
        color: "text.primary",
        fontWeight: 400,
        fontSize: "16px",
        fontFamily: "Lato",
      },

      variants: {
        inter: () => ({
          fontFamily: "Inter",
        }),
        italics: () => ({
          fontSize: "10px",
          fontWeight: 400,
          fontStyle: "italic",
        }),
        chartHeading: () => ({
          fontSize: "14px",
          fontWeight: 600,
        }),
      },
    },
  },
};

export default textStyles;
