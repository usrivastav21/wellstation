import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../api-client";

const changePin = async (data) => {
  const response = await apiClient.post("/auth/change-pin", data);
  return response.data;
};

export const useChangePin = (options) => {
  return useMutation({
    mutationFn: changePin,
    ...options,
  });
};
