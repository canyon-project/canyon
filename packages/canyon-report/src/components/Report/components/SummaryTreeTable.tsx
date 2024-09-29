import React from "react";
import { FileOutlined, FolderFilled } from "@ant-design/icons";
import { ConfigProvider, Progress, Space, Table } from "antd";
import { getColor } from "../../helpers";

function checkSuffix() {
  return true;
}

const CanyonReportTreeTable = ({
  dataSource,
  loading,
  onSelect,
}) => {
  const t = (res) => res;
  return (
    <div>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 0,
          },
        }}
      >
        <Table
          loading={loading}
          bordered={true}
          pagination={false}
          size={"small"}
          dataSource={dataSource}
          columns={[
            {
              title: t("Files"),
              key: "path",
              dataIndex: "path",
              render(text, record) {
                return (
                  <a
                    className={"flex gap-1"}
                    onClick={() => {
                      onSelect(text);
                    }}
                  >
                    {text.includes(".") && checkSuffix(text) ? (
                      <FileOutlined style={{ fontSize: "16px" }} />
                    ) : (
                      <FolderFilled style={{ fontSize: "16px" }} />
                    )}
                    {text.split("/").at(-1)}
                  </a>
                );
              },
            },

            {
              title: t("Total"),
              key: "total",
              dataIndex: ["statements", "total"],
              sorter(a, b) {
                return a.statements.total - b.statements.total;
              },
            },
            {
              title: t("Covered"),
              key: "covered",
              dataIndex: ["statements", "covered"],
              sorter(a, b) {
                return a.statements.covered - b.statements.covered;
              },
            },
          ].concat([
            {
              title: t("Coverage") + " %",
              width: "300px",
              key: "c",
              dataIndex: ["statements", "pct"],
              sorter(a, b) {
                return a.statements.pct - b.statements.pct;
              },
              render(text) {
                return (
                  <Progress
                    percent={text}
                    strokeLinecap="butt"
                    size={"small"}
                    strokeColor={getColor(text)}
                    className={"pr-5"}
                    status={"normal"}
                  />
                );
              },
            },
          ])}
        />
      </ConfigProvider>
    </div>
  );
};

export default CanyonReportTreeTable;
