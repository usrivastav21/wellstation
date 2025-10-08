import { v4 as uuidv4 } from "uuid";

export const generateReportId = () => {
  return uuidv4();
};
