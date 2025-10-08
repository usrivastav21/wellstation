import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../api-client";

const toApiBody = (data) => {
  return { user_id: data.userId, trial_id: data.trialId, email: data.email };
};

const linkTrial = async (data) => {
  const response = await apiClient.post("/trial/link", toApiBody(data));
  return response.data;
};

export const useLinkTrial = (options) => {
  return useMutation({
    mutationFn: linkTrial,
    ...options,
  });
};
