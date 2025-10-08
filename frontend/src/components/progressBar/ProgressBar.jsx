import { Box, Image } from "@chakra-ui/react";
import { Text } from "@mantine/core";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import LoaderImage from "../../assets/loader_image.png";

import { isFullSizeAtom } from "../../atoms";
import { UPDATED_TAB_SIZES } from "../../atoms/sd";

const CustomProgressBar = ({
  progress = "50",
  textKeyWord,
  isUploading = false,
}) => {
  const isFullSize = useAtomValue(isFullSizeAtom);
  // const SIZES = isFullSize ? QUARTER_SIZES : HALF_SIZES;
  const SIZES = UPDATED_TAB_SIZES;

  const breakpointValues = {
    progressBarHeight: {
      base: "18px",
      sm: "30px",
      md: "30px",
      lg: "20px",
      xl: SIZES[24],
    },
    progressBarWidth: {
      base: "100%",
      sm: "100%",
      md: "80%",
      lg: "60%",
      xl: SIZES[400],
    },
    textFontSize: {
      base: "16px",
      sm: "32px",
      md: "32px",
      lg: "20px",
      xl: SIZES[24],
    },
  };

  const progressValue = useMemo(() => {
    return 100 - progress;
  }, [progress]);

  const updatedProgressText = useMemo(() => {
    if (isUploading) {
      return textKeyWord;
    } else if (progress == 0 || progress == 100) {
      return `${textKeyWord} ${progress}%`;
    } else {
      return `${progress}%`;
    }
  }, [progress, textKeyWord, isUploading]);

  return (
    <Box
      width={{
        base: "100%",
      }}
      overflow="hidden"
      mb={0}
    >
      <Text fz="4xl">{updatedProgressText}</Text>
      <Box
        width="100%"
        height={{
          sm: "1.2rem",
          md: "1.4rem",
          lg: "1.4rem",
        }}
        border="2px solid #3D50F5"
        borderRadius="full"
        overflow="hidden"
        mt="8px"
      >
        <Image
          src={LoaderImage}
          width="100%"
          height="100%"
          marginRight={"0%"}
          objectFit="cover"
          alt="progressBar"
          borderRadius="full"
          transform={`translateX(${-progressValue}%)`}
          transition="transform 0.5s ease"
        />
      </Box>
    </Box>
  );
};

export default CustomProgressBar;
