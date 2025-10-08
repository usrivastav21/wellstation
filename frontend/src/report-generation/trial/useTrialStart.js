import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../api-client";

const startTrial = async () => {
  const response = await apiClient.post("/trial/start");
  return response.data;
};

export const useTrialStart = (options) => {
  return useMutation({
    mutationFn: startTrial,

    ...options,
  });
};
