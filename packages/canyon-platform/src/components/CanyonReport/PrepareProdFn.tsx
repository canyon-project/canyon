import React, { useState } from "react";
import { Alert, Button, Drawer } from "antd";
import { Editor } from "@monaco-editor/react";
import { useRequest } from "ahooks";
import axios from "axios";

const PrepareProdFn: React.FC = () => {
  const [open, setOpen] = useState(false);
  const prm = useParams();
  const [spams] = useSearchParams();
  const { data, loading, run } = useRequest(
    () =>
      axios
        .post(
          atob(`aHR0cHM6Ly90cmlwY2FueW9uLmZ3cy5xYS5udC5jdHJpcGNvcnAuY29t`) +
            "/api/coverage/prepareProdFn",
          {
            projectID: prm.id,
            sha: prm.sha,
            username: localStorage.getItem("username"),
            path: spams.get("path"),
          },
        )
        .then(({ data }) => data),
    {
      manual: true,
    },
  );

  const {
    data: da1,
    run: run1,
    loading: loading1,
  } = useRequest(
    () =>
      axios
        .post(
          atob(`aHR0cHM6Ly90cmlwY2FueW9uLmZ3cy5xYS5udC5jdHJpcGNvcnAuY29t`) +
            "/flytest-api-ctrip-coffeebean-transfer/api/task/triggerPullTrafficByFn",
          data,
        )
        .then(({ data }) => data),
    {
      manual: true,
      onSuccess() {
        message.success("开始转换，请留意后续Flybirds消息推送");
      },
    },
  );

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      run();
    }
  }, [open]);

  return (
    <>
      {[
        "tripgl-37885-auto",
        "tripgl-62594-auto",
        "tripgl-108960-auto",
      ].includes(prm.id || "") && (
        <Button type="primary" onClick={showDrawer} size={"small"}>
          转换生产流量为测试用例
        </Button>
      )}

      <Drawer
        title="转换生产流量为测试用例"
        onClose={onClose}
        open={open}
        destroyOnClose
        width={"75%"}
      >
        <Spin spinning={loading}>
          <Button type={"primary"} onClick={run1} loading={loading1}>
            确认转换
          </Button>
          <div className={"h-2"} />
          <Alert
            message={
              "以下是拉取的Canyon测试未覆盖函数，MPASS生产已覆盖的流量数据"
            }
          />
          <div className={"h-2"} />
          <Editor
            language={"json"}
            value={JSON.stringify(data || {}, null, 2)}
            height={"70vh"}
          />
        </Spin>
      </Drawer>
    </>
  );
};

export default PrepareProdFn;
