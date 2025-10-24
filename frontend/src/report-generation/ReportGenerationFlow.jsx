import { useAtom, useAtomValue } from "jotai";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loggedInUserAtom, stepAtom } from "../atoms/index.js";
import { AnalysisLoading } from "./AnalysisLoading";
import { SessionComplete } from "./SessionComplete";
import { VoiceScanning } from "./VoiceScanning";

import { Navigate } from "react-router";
import {
  getCurrentRoleData,
  isRoleLoggedIn,
  logoutUser,
} from "../api-client/index.js";
import { Dashboard } from "../dashboard";
import { FacialAnalysis } from "./facial-analysis";
import { Report, Result } from "./result";
import { Welcome } from "./Welcome";
import { Center, Loader } from "@mantine/core";

// Lazy load components
const ConsentForm = React.lazy(() => import("./ConsentForm.jsx"));
const BasicInfo = React.lazy(() => import("./BasicInfo.jsx"));
// const FacialAnalysis = React.lazy(() => import("./FacialAnalysis.jsx"));
const ConsentDeclined = React.lazy(() => import("./ConsentDeclined.jsx"));
import { ClinicalInsights } from "./ClinicalInsights.jsx";

const STEP_COMPONENTS = {
  welcome: Welcome,
  consentForm: ConsentForm,
  dashboard: Dashboard,
  consentDeclined: ConsentDeclined,
  // basicInfo: BasicInfo,
  facialAnalysis: FacialAnalysis,
  voiceScanning: VoiceScanning,
  analysisLoading: AnalysisLoading,
  result: Result,
  // result: EmailResult,
  report: Report,
  clinicalInsights: ClinicalInsights,
  sessionComplete: SessionComplete,
  default: Welcome,
  // waitlist: Waitlist,
};

export const ReportGenerationFlow = () => {
  const [step, setStep] = useAtom(stepAtom);

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(60);
  const isHeaderVisible = useMemo(() => {
    return !["welcome", "sessionComplete"].includes(step);
  }, [step]);

  const loggedInUser =
    useAtomValue(loggedInUserAtom) || getCurrentRoleData("admin");

  const updateHeaderHeight = useCallback(() => {
    if (headerRef.current && isHeaderVisible) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [isHeaderVisible]);

  useEffect(() => {
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, [updateHeaderHeight]);

  const CurrentStepComponent = useMemo(() => {
    return STEP_COMPONENTS[step] || STEP_COMPONENTS.default;
  }, [step]);

  const handleClickExit = useCallback(() => {
    setStep("welcome");
    if (isRoleLoggedIn("user")) {
      logoutUser();
    }
  }, [setStep]);

  if (!loggedInUser) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <>
      {/* <Header
          isHeaderVisible={isHeaderVisible}
          ref={headerRef}
          paddedWidth={paddedWidth}
          isFullSize={isFullSize}
          isExitButtonVisible={isExitButtonVisible}
          handleClickExit={handleClickExit}
          isInsideBooth={true}
        /> */}
      <React.Suspense
        fallback={
          <Center h={"100%"}>
            <Loader size="sm" />
          </Center>
        }
      >
        <CurrentStepComponent />
      </React.Suspense>
    </>
  );
};
