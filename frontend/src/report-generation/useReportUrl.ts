import { useAtomValue } from "jotai";

import { getCurrentRoleData } from "../api-client/auth";
import { boothVenueAtom, reportIdAtom, trialIdAtom } from "../atoms";
import { config } from "../config";

const useReportUrl = ({ reportId: userReportId }: { reportId: string }) => {
  const boothVenue =
    useAtomValue(boothVenueAtom) || localStorage.getItem("boothVenue");
  const loggedInUser = getCurrentRoleData("admin");
  const reportId = useAtomValue(reportIdAtom);
  const trialId = useAtomValue(trialIdAtom);

  const finalReportId = userReportId ? userReportId : trialId ? trialId : reportId;
  
  console.log("useReportUrl debug:", {
    configReportUrl: config.REPORT_URL,
    finalReportId,
    boothVenue,
    loggedInUser,
    launch: loggedInUser?.launch
  });

  const url = `${config.REPORT_URL}/${finalReportId}?boothVenue=${
    boothVenue ? encodeURIComponent(boothVenue) : ""
  }&launch=${encodeURIComponent(loggedInUser?.launch || "")}&isCorporate=true`;
  
  console.log("Generated URL:", url);
  return url;
};

export { useReportUrl };