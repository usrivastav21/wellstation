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

  return `${config.REPORT_URL}/${
    userReportId ? userReportId : trialId ? trialId : reportId
  }?boothVenue=${
    boothVenue ? encodeURIComponent(boothVenue) : ""
  }&launch=${encodeURIComponent(loggedInUser.launch)}&isCorporate=true`;
};

export { useReportUrl };
