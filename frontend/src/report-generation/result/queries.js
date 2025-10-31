import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api-client";
import { API_ENDPOINTS } from "../../api-client/endpoints";
import { findRestingHeartRateResult } from "./report-utils";

const reportKeys = {
  report: (reportId) => ["report", reportId],
  triaReport: (trialId) => ["triaReport", trialId],
};

const toClientReport = (report) => {
  try {
    // Handle null/undefined gracefully
    if (!report) {
      console.warn("toClientReport: Received null or undefined report");
      return {
        reportId: null,
        mentalHealthScores: { anxiety: null, depression: null, stress: null },
        vitalSigns: { heart_rate: null },
      };
    }

    let responseData = report;

    console.log("responseData", responseData);
    console.log("mental_health_scores", responseData?.mental_health_scores);
    
    // Safely get heart rate result with fallbacks
    let heartRateResult = null;
    try {
      heartRateResult = findRestingHeartRateResult({
        restingHeartRate: responseData?.vital_signs?.heart_rate,
        ageRange: responseData?.ageRange,
        gender: responseData?.gender,
      });
    } catch (error) {
      console.warn("Error calculating heart rate result:", error);
    }

    responseData = {
      ...responseData,
      mentalHealthScores: {
        anxiety: responseData?.mental_health_scores?.anxiety ?? null,
        depression: responseData?.mental_health_scores?.depression ?? null,
        stress: responseData?.mental_health_scores?.stress ?? null,
      },
      vitalSigns: {
        ...responseData?.vital_signs,
        heartRateResult,
      },
    };

    const transformedData = {
      ...responseData,
      reportId: responseData._id || responseData.id || null,
    };
    
    console.log("transformedData", transformedData);
    console.log("transformedData.mentalHealthScores", transformedData.mentalHealthScores);
    
    return transformedData;
  } catch (error) {
    console.error("Error transforming report data:", error);
    // Return a safe default structure to prevent UI crashes
    return {
      reportId: report?._id || report?.id || null,
      mentalHealthScores: { anxiety: null, depression: null, stress: null },
      vitalSigns: { heart_rate: null },
      ...report, // Include original data as fallback
    };
  }
};

const fetchReport = async ({ queryKey }) => {
  try {
    const [, reportId] = queryKey;
    
    if (!reportId) {
      throw new Error("Report ID is required");
    }
    
    const response = await apiClient.get(API_ENDPOINTS.REPORT.GET(reportId));
    
    // Handle both array and object responses
    const data = Array.isArray(response.data) 
      ? response.data[0] 
      : response.data?.data || response.data;
    
    if (!data) {
      throw new Error("No data received from server");
    }
    
    return toClientReport(data);
  } catch (error) {
    // Enhanced error logging
    console.error("fetchReport error:", {
      error,
      message: error?.response?.data?.message || error?.message,
      status: error?.response?.status,
      reportId: queryKey[1],
    });
    throw error; // Re-throw to let React Query handle it
  }
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
  try {
    const [, trialId] = ctx.queryKey;
    
    if (!trialId) {
      throw new Error("Trial ID is required");
    }
    
    const response = await apiClient.get(`/trial/report/${trialId}`);
    const data = response.data?.data || response.data;
    
    if (!data) {
      throw new Error("No data received from server");
    }
    
    return toClientReport(data);
  } catch (error) {
    // Enhanced error logging
    console.error("fetchTrialReport error:", {
      error,
      message: error?.response?.data?.message || error?.message,
      status: error?.response?.status,
      trialId: ctx.queryKey[1],
    });
    throw error; // Re-throw to let React Query handle it
  }
};

export const useTrialReport = (trialId, options) => {
  return useQuery({
    queryKey: reportKeys.triaReport(trialId),
    queryFn: fetchTrialReport,
    enabled: !!trialId,
    ...options,
  });
};
