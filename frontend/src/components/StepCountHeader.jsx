import { Flex, Text, useBreakpointValue } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { isFullSizeAtom } from "../atoms";
import { UPDATED_TAB_SIZES } from "../atoms/sd";
import RedCircleText from "./RedCircleText";

const StepCountHeader = ({ step = 1, totalSteps = 3 }) => {
  const isFullSize = useAtomValue(isFullSizeAtom);
  // const SIZES = isFullSize ? QUARTER_SIZES : HALF_SIZES;
  const SIZES = UPDATED_TAB_SIZES;

  const fontSizes = {
    step: {
      base: "14px",
      sm: "32px",
      md: "32px",
      lg: "16px",
      xl: SIZES[20],
    },
    count: {
      base: "24px",
      sm: "48px",
      md: "48px",
      lg: "24px",
      xl: SIZES[28],
    },
  };

  const breakPointValues = {
    circleDiameter: {
      base: SIZES[28],
      sm: SIZES[28],
      md: "60px",
      lg: SIZES[54],
      xl: SIZES[54],
    },
    stepGap: {
      base: SIZES[8],
      sm: SIZES[16],
      md: SIZES[16],
      lg: SIZES[6],
      xl: SIZES[6],
    },
    stepContainerBottomMargin: {
      base: SIZES[16],
      sm: SIZES[16],
      md: SIZES[16],
      lg: SIZES[16],
      xl: SIZES[16],
    },
  };

  const circleDiameter = useBreakpointValue(breakPointValues.circleDiameter);
  const stepFontSize = useBreakpointValue(fontSizes.step);
  const countFontSize = useBreakpointValue(fontSizes.count);
  const stepGap = useBreakpointValue(breakPointValues.stepGap);
  const stepContainerBottomMargin = useBreakpointValue(
    breakPointValues.stepContainerBottomMargin
  );

  return (
    <Flex direction="column" mb={stepContainerBottomMargin}>
      <Text
        width="100%"
        fontSize={{
          base: "1rem",
          sm: "1.2rem",
          md: "1.35rem",
          lg: "1.6rem",
        }}
        fontWeight="bold"
        fontFamily="Lato"
        marginBottom={{
          base: 2,
          sm: 2,
          md: 2,
          lg: 1,
        }}
      >
        Step
      </Text>
      <Flex
        align="center"
        justify="flex-start"
        gap={{ base: SIZES[6], sm: SIZES[8] }}
      >
        <RedCircleText
          height={{
            sm: "3rem",
            md: "3.5rem",
            lg: "4.4rem",
          }}
          width={{
            sm: "3rem",
            md: "3.5rem",
            lg: "4.4rem",
          }}
          textComponent={
            <Text
              fontFamily="Lato"
              fontWeight="extrabold"
              color="white"
              fontSize={{
                base: "1rem",
                sm: "2rem",
                md: "2.2rem",
                lg: "2.8rem",
              }}
            >
              <i>{step}</i>
            </Text>
          }
        />
        <Text
          fontFamily="Lato"
          fontSize={{
            base: "1rem",
            sm: "1rem",
            md: "1.2rem",
            lg: "1.6rem",
          }}
        >
          <i>
            {"\u00A0"}of{"\u00A0"}
            {"\u00A0"}
            {"\u00A0"}
            {totalSteps}
          </i>
        </Text>
      </Flex>
    </Flex>
  );
};

export default StepCountHeader;
