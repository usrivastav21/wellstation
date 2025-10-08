import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const stepAtom = atom("welcome");
stepAtom.debugLabel = "step";
// export const stepAtom = atom("consentForm");
// export const stepAtom = atom("consentDeclined");
// export const stepAtom = atom("basicInfo");
// export const stepAtom = atom("facialAnalysis");
// export const stepAtom = atom("voiceScanning");
// export const stepAtom = atom("analysisLoading");
// export const stepAtom = atom("report");
// export const stepAtom = atom("result");
// export const stepAtom = atom("sessionComplete");
// export const stepAtom = atom("waitlist");

export const selectedGenderAtom = atomWithStorage("gender", "");
selectedGenderAtom.debugLabel = "selectedGender";

export const ageAtom = atomWithStorage("age", "");
ageAtom.debugLabel = "age";

export const reportIdAtom = atom("");
reportIdAtom.debugLabel = "reportId";

export const userIdAtom = atom("");
userIdAtom.debugLabel = "userId";

export const trialIdAtom = atom("");
trialIdAtom.debugLabel = "trialId";

export const paddedWidthAtom = atom("100%");
paddedWidthAtom.debugLabel = "paddedWidth";

export const isFullSizeAtom = atom(true);
isFullSizeAtom.debugLabel = "isFullSize";

export const boothVenueAtom = atom(null);
boothVenueAtom.debugLabel = "boothVenue";

export const loggedInUserAtom = atom(null);
loggedInUserAtom.debugLabel = "loggedInUser";
