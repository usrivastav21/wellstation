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
  const apiBody = transformDataForApi(data);
  const response = await apiClient.post("/send/email", apiBody);
  return response.data;
};

export const useSendEmail = (options) => {
  return useMutation({
    mutationFn: sendEmail,
    ...options,
  });
};
