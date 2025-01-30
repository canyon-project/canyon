import React, { FC } from "react";
import { FileOutlined, FolderFilled } from "@ant-design/icons";
import { ConfigProvider, Progress, Table } from "antd";
// import { getColor } from "../../helpers";
import { CoverageSummaryData } from "istanbul-lib-coverage";
import { getColor } from "../helpers";
import { css } from "@emotion/react";

function checkSuffix(str: string) {
  console.log(str);
  return true;
}

const CanyonReportTreeTable: FC<{
  dataSource: (CoverageSummaryData & { path: string })[];
  onSelect: (path: string) => void;
  style?: React.CSSProperties;
}> = ({ dataSource, onSelect, style }) => {
  const t = (res: string) => res;
  return (
    <div style={style}>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 0,
          },
        }}
      >
        <Table
          rowKey={"path"}
          bordered={true}
          pagination={false}
          size={"small"}
          dataSource={dataSource}
          columns={[
            {
              title: t("Files"),
              key: "path",
              dataIndex: "path",
              render(text) {
                return (
                  <a
                    css={css`
                      display: flex;
                      gap: 10px;
                    `}
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
                    css={css`
                      padding-right: 5px;
                    `}
                    status={"normal"}
                  />
                );
              },
            },
          ]}
        />
      </ConfigProvider>
    </div>
  );
};

export default CanyonReportTreeTable;
