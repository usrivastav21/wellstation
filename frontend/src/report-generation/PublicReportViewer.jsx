import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { useReport } from "./result/queries";
import { Report } from "./result/Report";
import { Center, Loader, Text, Stack } from "@mantine/core";

export const PublicReportViewer = () => {
  const { reportId } = useParams();
  const [searchParams] = useSearchParams();
  const [isValidReport, setIsValidReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get URL parameters
  const boothVenue = searchParams.get("boothVenue");
  const launch = searchParams.get("launch");
  const isCorporate = searchParams.get("isCorporate");

  console.log("PublicReportViewer - URL params:", {
    reportId,
    boothVenue,
    launch,
    isCorporate
  });

  // Use the existing useReport hook to fetch the report
  const { data: report, isLoading: reportLoading, isError: reportError } = useReport(reportId);

  useEffect(() => {
    if (reportLoading) {
      setIsLoading(true);
    } else if (reportError) {
      setIsValidReport(false);
      setIsLoading(false);
    } else if (report) {
      setIsValidReport(true);
      setIsLoading(false);
    }
  }, [report, reportLoading, reportError]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading report...</Text>
        </Stack>
      </Center>
    );
  }

  if (!isValidReport || reportError) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Text size="xl" fw="bold" c="red">
            Report Not Found
          </Text>
          <Text c="dimmed">
            The report you're looking for doesn't exist or is no longer available.
          </Text>
          <Text size="sm" c="dimmed">
            Report ID: {reportId}
          </Text>
        </Stack>
      </Center>
    );
  }

  // Render the report using the existing Report component
  return <Report />;
};
