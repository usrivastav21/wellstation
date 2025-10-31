import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../api-client";

const transformDataForApi = (data) => {
  return {
    report_link: data.reportLink,
    subject: "Your Wellbeing Report from W3LL Station",
    name: data.name,
    to_email: data.email,
    report_id: data.reportId,
    mood: data?.mood,
  };
};

const sendEmail = async (data) => {
  try {
    // Validate required fields
    if (!data?.email || !data?.reportId) {
      throw new Error("Email and report ID are required");
    }
    
    const apiBody = transformDataForApi(data);
    const response = await apiClient.post("/send/email", apiBody);
    
    if (!response?.data) {
      throw new Error("No response data received from server");
    }
    
    return response.data;
  } catch (error) {
    // Enhanced error logging
    console.error("sendEmail error:", {
      error,
      message: error?.response?.data?.message || error?.message,
      status: error?.response?.status,
      data: { email: data?.email, reportId: data?.reportId },
    });
    throw error; // Re-throw to let mutation handle it
  }
};

export const useSendEmail = (options) => {
  return useMutation({
    mutationFn: sendEmail,
    ...options,
  });
};
