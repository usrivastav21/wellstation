import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../api-client";

const resetPin = async (payload) => {
  await apiClient.post("/auth/reset-pin", payload);
};

export const useResetPin = (options) => {
  return useMutation({
    mutationFn: resetPin,
    ...options,
  });
};
