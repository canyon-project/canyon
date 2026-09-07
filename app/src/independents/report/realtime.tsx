import { Alert } from "antd";
import { useTranslation } from "react-i18next";

const ReportIndependent = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <Alert
        type="info"
        showIcon
        message={t("projects.report.realtime_deprecated_title")}
        description={t("projects.report.realtime_deprecated_desc")}
      />
    </div>
  );
};

export default ReportIndependent;
