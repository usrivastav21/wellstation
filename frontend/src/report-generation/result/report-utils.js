export const normalizeAgeRange = (ageRange) => {
  if (!ageRange) return "";
  return ageRange.replace(/\s+/g, ""); // Remove all spaces
};

const ageRangeText = (ageRange) => {
  if (ageRange == "Lessthan18" || ageRange == "<18") {
    return "<18";
  }
  if (ageRange == "Morethan65" || ageRange == "65+") {
    return "65+";
  }
  return ageRange;
};

const restingHeartRateRanges = {
  male: {
    "<18": { good: [40, 65], mid: [66, 81], poor: [82] },
    "18-25": { good: [40, 65], mid: [66, 81], poor: [82] },
    "26-35": { good: [44, 65], mid: [66, 81], poor: [82] },
    "36-45": { good: [47, 66], mid: [67, 82], poor: [83] },
    "46-55": { good: [49, 67], mid: [68, 83], poor: [84] },
    "56-65": { good: [51, 67], mid: [68, 81], poor: [82] },
    "66+": { good: [52, 65], mid: [66, 79], poor: [80] },
    "65+": { good: [52, 65], mid: [66, 79], poor: [80] },
  },
  female: {
    "<18": { good: [40, 69], mid: [70, 84], poor: [85] },
    "18-25": { good: [40, 69], mid: [70, 84], poor: [85] },
    "26-35": { good: [42, 68], mid: [69, 82], poor: [83] },
    "36-45": { good: [45, 69], mid: [70, 84], poor: [85] },
    "46-55": { good: [48, 69], mid: [70, 83], poor: [84] },
    "56-65": { good: [50, 68], mid: [69, 83], poor: [84] },
    "66+": { good: [52, 68], mid: [69, 84], poor: [84] },
    "65+": { good: [52, 68], mid: [69, 84], poor: [84] },
  },
};

export const findRestingHeartRateResult = ({
  restingHeartRate,
  gender,
  ageRange,
}) => {
  // console.log("<= findRestingHeartRateResult", {
  //   restingHeartRate,
  //   gender,
  //   ageRange,
  // });
  // Return default value if any required parameter is missing
  if (!restingHeartRate || !gender || !ageRange) {
    return "mid"; // Default fallback value
  }

  // Normalize the age range input
  let normalizedAgeRange = normalizeAgeRange(ageRange);

  normalizedAgeRange = ageRangeText(normalizedAgeRange);

  // Get the ranges for the given gender and normalized age range
  const ranges = restingHeartRateRanges[gender]?.[normalizedAgeRange];

  if (!ranges) {
    // Return default instead of throwing error
    return "mid";
  }

  // Check which range the restingHeartRate falls into
  if (
    restingHeartRate >= ranges.good[0] &&
    restingHeartRate <= (ranges.good[1] || Infinity)
  ) {
    return "low";
  } else if (
    restingHeartRate >= ranges.mid[0] &&
    restingHeartRate <= (ranges.mid[1] || Infinity)
  ) {
    return "medium";
  } else if (restingHeartRate >= ranges.poor[0]) {
    return "high";
  } else {
    // Return default instead of throwing error
    return "medium";
  }
};

export const findRestingHeartRateIndicatorValue = ({
  restingHeartRate,
  gender,
  ageRange,
}) => {
  // Return default value if any required parameter is missing
  if (!restingHeartRate || !gender || !ageRange) {
    return "mid"; // Default fallback value
  }

  // Normalize the age range input
  const normalizedAgeRange = normalizeAgeRange(ageRange);

  // Get the ranges for the given gender and normalized age range
  const ranges = restingHeartRateRanges[gender]?.[normalizedAgeRange];

  if (!ranges) {
    // Return default instead of throwing error
    return "mid";
  }

  // Check which range the restingHeartRate falls into
  if (
    restingHeartRate >= ranges.good[0] &&
    restingHeartRate <= (ranges.good[1] || Infinity)
  ) {
    return "good";
  } else if (
    restingHeartRate >= ranges.mid[0] &&
    restingHeartRate <= (ranges.mid[1] || Infinity)
  ) {
    return "mid";
  } else if (restingHeartRate >= ranges.poor[0]) {
    return "poor";
  } else {
    // Return default instead of throwing error
    return "mid";
  }
};

export const getUpdatedHeartRateText = (t, ageRange, gender) => {
  // Return default text if required parameters are missing
  if (!ageRange || !gender) {
    return t("report.infoText.heartRateText.default", {
      returnObjects: true,
    });
  }

  // console.log("<= ageRange before update", ageRange);
  const normalizedAgeRange = normalizeAgeRange(ageRange);

  const updatedAgeRangeText = ageRangeText(normalizedAgeRange);
  // console.log("<= ageRange updatedAgeRangeText", updatedAgeRangeText);

  const text = t(
    `report.infoText.heartRateText.${gender}.${updatedAgeRangeText}`,
    {
      returnObjects: true,
    }
  );

  // console.log("<= getUpdatedHeartRateText", text);
  return text;
};

const COLOR = {
  GREEN: "#33CA7E",
  GOLD: "#F19C34",
  RED: "#C94332",
};

export const getColorV2 = (value) => {
  if (!isNaN(value)) {
    if (value >= 68) return COLOR.RED;
    if (value >= 34) return COLOR.GOLD;
    return COLOR.GREEN;
  }
};
