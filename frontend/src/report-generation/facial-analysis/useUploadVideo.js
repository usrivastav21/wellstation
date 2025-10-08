import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../api-client";

export const uploadVideo = async (payload) => {
  console.log("payload", payload);
  try {
    const response = await apiClient.post(`/video`, payload);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const useUploadVideo = (options) => {
  return useMutation({
    mutationFn: uploadVideo,
    ...options,
  });
};
