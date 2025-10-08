const getMentalHealthScoresLevelColor = (level) => {
  switch (level) {
    case "high":
      return "#C94332";

    case "low":
      return "#20B66B";

    case "medium":
      return "#F19C34";

    default:
      return "#000000";
  }
};

const getLevelsDisplayText = (level) => {
  switch (level) {
    case "high":
      return "High";

    case "low":
      return "Low";

    case "medium":
      return "Moderate";

    default:
      return "Unknown";
  }
};

export { getMentalHealthScoresLevelColor, getLevelsDisplayText };
