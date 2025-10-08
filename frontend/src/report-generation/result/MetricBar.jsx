import { Box, Image } from "@chakra-ui/react";
import LevelIndicator from "../../assets/report_level_indicator.png";

export const MetricBar = ({ value = "99" }) => {
  const gradientBg = `linear-gradient(90deg, rgba(51,202,126,1) 0%, rgba(51,202,126,1) 31%, rgba(241,156,52,1) 33%, rgba(241,156,52,1) 66%, rgba(201,67,50,1) 68%)`;

  // console.log("<= value MetricBarV2", value);

  return (
    <Box width="100%">
      <Box width="100%" mb={1}>
        <Image
          src={LevelIndicator}
          height="10px"
          width="10px"
          objectFit="contain"
          ml={`${value}%`}
        />
      </Box>
      <Box width="100%" height="10px" bg={gradientBg} borderRadius="full"></Box>
    </Box>
  );
};
