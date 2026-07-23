import { CanyonReportApp } from "@canyonjs/report-component";
import { useRequest } from "ahooks";
import { Alert, Spin } from "antd";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { getSnapshotReportData } from "@/services/snapshot";

const SnapshotReport = () => {
  const params = useParams();
  const snapshotID = params.snapshotID;
  const defaultValue = useMemo(() => params["*"]?.replace(/^-?\//, "") || "", [params["*"]]);

  const { data, loading, error } = useRequest(
    () => getSnapshotReportData(snapshotID!),
    {
      ready: !!snapshotID,
      refreshDeps: [snapshotID],
    },
  );

  if (!snapshotID) {
    return <Alert type="error" message="缺少 snapshotID" showIcon className="m-3" />;
  }

  if (error) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      (error as Error)?.message ||
      "加载快照报告失败";
    return <Alert type="error" message={message} showIcon className="m-3" />;
  }

  return (
    <Spin spinning={loading}>
      <div className="p-[6px]">
        {data ? (
          <CanyonReportApp
            files={data.files ?? []}
            instrumentCwd={data.instrumentCwd || "__canyon_snapshot__"}
            generatedAt={data.generatedAt}
            defaultValue={defaultValue}
            packageName="@canyonjs/report"
            packageVersion={typeof data.version === "string" ? data.version : undefined}
            height="calc(100vh - 12px)"
          />
        ) : (
          <div style={{ height: "calc(100vh - 12px)" }} />
        )}
      </div>
    </Spin>
  );
};

export default SnapshotReport;
