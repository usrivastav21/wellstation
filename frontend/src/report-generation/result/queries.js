import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api-client";
import { API_ENDPOINTS } from "../../api-client/endpoints";
import { findRestingHeartRateResult } from "./report-utils";

const reportKeys = {
  report: (reportId) => ["report", reportId],
  triaReport: (trialId) => ["triaReport", trialId],
};

const toClientReport = (report) => {
  let responseData = report;

  console.log("responseData", responseData);
  console.log("mental_health_scores", responseData?.mental_health_scores);
  let heartRateResult = findRestingHeartRateResult({
    restingHeartRate: responseData?.vital_signs?.heart_rate,
    ageRange: responseData?.ageRange,
    gender: responseData?.gender,
  });

  responseData = {
    ...responseData,
    mentalHealthScores: {
      anxiety: responseData?.mental_health_scores?.anxiety,
      depression: responseData?.mental_health_scores?.depression,
      stress: responseData?.mental_health_scores?.stress,
    },
    vitalSigns: {
      ...responseData?.vital_signs,
      heartRateResult,
    },
  };

  const transformedData = {
    ...responseData,
    reportId: responseData._id || responseData.id,
  };
  
  console.log("transformedData", transformedData);
  console.log("transformedData.mentalHealthScores", transformedData.mentalHealthScores);
  
  return transformedData;
};

const fetchReport = async ({ queryKey }) => {
  const [, reportId] = queryKey;
  const response = await apiClient.get(API_ENDPOINTS.REPORT.GET(reportId));
  // Handle both array and object responses
  const data = Array.isArray(response.data) ? response.data[0] : response.data;
  return toClientReport(data);
};

export const useReport = (reportId, options) => {
  return useQuery({
    queryKey: reportKeys.report(reportId),
    queryFn: fetchReport,
    enabled: !!reportId,
    ...options,
  });
};

const fetchTrialReport = async (ctx) => {
  const [, trialId] = ctx.queryKey;
  const response = await apiClient.get(`/trial/report/${trialId}`);
  return toClientReport(response.data.data);
};

export const useTrialReport = (trialId, options) => {
  return useQuery({
    queryKey: reportKeys.triaReport(trialId),
    queryFn: fetchTrialReport,
    enabled: !!trialId,
    ...options,
  });
};
