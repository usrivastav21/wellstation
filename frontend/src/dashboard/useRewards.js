import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api-client";

const toClientRewards = (response) => {
  return {
    totalRewardPoints: response.data.data.total_reward_points,
    shouldShowRewards: response.data.data.should_show_rewards,
  };
};

const fetchRewards = async (context) => {
  const [, email, reportId] = context.queryKey;
  const response = await apiClient.get(
    `/reports/rewards?email=${email}${reportId ? `&report_id=${reportId}` : ""}`
  );

  return toClientRewards(response);
};

export const useRewards = ({ email, reportId }) => {
  return useQuery({
    queryKey: ["rewards", email, reportId],
    queryFn: fetchRewards,
    enabled: !!email,
  });
};
