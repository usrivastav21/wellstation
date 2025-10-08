export const metrics = [
  // {
  //   name: "bloodPressure",
  //   key: "bloodPressure",
  //   unit: "mmHg",
  //   accessor: "bloodPressure",
  //   isNumeric: true,
  // },
  {
    name: "stressLevel",
    key: "stressLevel",
    accessor: "stressLevels",
    isNumeric: false,
  },
  // {
  //   name: "restingHeartRate",
  //   key: "restingHeartRate",
  //   unit: "BPM",
  //   accessor: "restingHeartRate",
  //   isNumeric: true,
  // },
  {
    name: "anxietyLevel",
    key: "anxietyLevel",
    accessor: "anxietyLevels",
    isNumeric: false,
  },
  // {
  //   name: "bloodOxygenLevel",
  //   key: "bloodOxygenLevel",
  //   unit: "%",
  //   accessor: "bloodOxygenLevels",
  //   isNumeric: true,
  // },
  {
    name: "depressionLevel",
    key: "depressionLevel",
    accessor: "depressionLevels",
    isNumeric: false,
  },
];

export const legends = [
  { name: "good", color: "#33CA7E" },
  { name: "mid", color: "#F19C34" },
  { name: "poor", color: "#C94332" },
];
