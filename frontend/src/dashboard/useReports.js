import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api-client";

const toClientReports = (response) => {
  return response.data;
};

const fetchMonthReports = async (context) => {
  const [, month, email] = context.queryKey;

  const response = await apiClient.get(
    `/reports/month?email=${email}&month=${month}`
  );
  return toClientReports(response);
};

export const useMonthReports = ({ month, email }) => {
  return useQuery({
    queryKey: ["reports", month, email],
    queryFn: fetchMonthReports,
    enabled: !!email,
  });
};

const toClientWeekReports = (response) => {
  return response.data;
};

const fetchWeekReports = async (context) => {
  const [, weekRange, email] = context.queryKey;

  const response = await apiClient.get(
    `/reports/weekly?date_range=${weekRange}&email=${email}`
  );

  return toClientWeekReports(response);
};

export const useWeekReports = ({ weekRange, email }) => {
  return useQuery({
    queryKey: ["reports", weekRange, email],
    queryFn: fetchWeekReports,
    enabled: !!email,
  });
};

const toClientMonthReportsWithIntervals = (response) => {
  return response.data;
};

const fetchMonthReportsWithIntervals = async (context) => {
  const [, , month, email] = context.queryKey;

  const response = await apiClient.get(
    `/reports/monthly?email=${email}&date=${month}`
  );

  return toClientMonthReportsWithIntervals(response);
};

export const useMonthReportsWithIntervals = ({ month, email }) => {
  return useQuery({
    queryKey: ["reports", "intervals", month, email],
    queryFn: fetchMonthReportsWithIntervals,
    enabled: !!email,
  });
};

const toClientYearReports = (response) => {
  return response.data;
};

const fetchYearReports = async (context) => {
  const [, , year, email] = context.queryKey;
  const response = await apiClient.get(
    `/reports/year?email=${email}&date=${year}`
  );
  return toClientYearReports(response);
};

export const useYearReports = ({ year, email }) => {
  return useQuery({
    queryKey: ["reports", "year", year, email],
    queryFn: fetchYearReports,
    enabled: !!email,
  });
};
