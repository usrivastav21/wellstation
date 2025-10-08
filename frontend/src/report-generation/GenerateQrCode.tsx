import QRCode from "react-qr-code";

import { useReportUrl } from "./useReportUrl";

export const GenerateQrCode = ({
  size = 50,
  reportId,
}: {
  size: number;
  reportId: string;
}) => {
  const reportUrl = useReportUrl({ reportId });

  return <QRCode value={reportUrl} size={size} />;
};
