import { EmailResult } from "./report-generation/result/EmailResult";
import { Provider } from "jotai";
import { stepAtom, reportIdAtom } from "./atoms";
import { atom } from "jotai";

// Create a development-specific atom with initial values
const devStepAtom = atom("emailResult");
const devReportIdAtom = atom("dev-report-123");

export const DevEmailResult = () => {
  return (
    <Provider
      initialValues={[
        [stepAtom, "emailResult"],
        [reportIdAtom, "dev-report-123"],
      ]}
    >
      <EmailResult />
    </Provider>
  );
};
