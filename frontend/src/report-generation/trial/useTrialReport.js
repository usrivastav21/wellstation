import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api-client";

const fetchTrialReport = async (ctx) => {
  const [, trialId] = ctx.queryKey;
  const response = await apiClient.get(`/trial/report/${trialId}`);
  return response.data;
};

export const useTrialReport = (trialId) => {
  return useQuery({
    queryKey: ["trialReport", trialId],
    queryFn: fetchTrialReport,
    enabled: !!trialId,
  });
};
