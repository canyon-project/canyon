import { Table, Progress, ConfigProvider } from "antd";
import React, { FC } from "react";
import Highlighter from "react-highlight-words";
import { getColor } from "../../helpers";
import { CoverageSummaryData } from "istanbul-lib-coverage";

const t = (msg: string) => msg;
const SummaryListTable: FC<{
  dataSource: (CoverageSummaryData & { path: string })[];
  onSelect: (path: string) => void;
  value: string;
  filenameKeywords: string;
}> = ({ dataSource, onSelect, value, filenameKeywords }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 0,
        },
      }}
    >
      <Table
        bordered={true}
        pagination={{
          defaultPageSize: 15,
        }}
        size={"small"}
        dataSource={dataSource.filter((item) => {
          return item.path.startsWith(value);
        })}
        rowKey={"path"}
        columns={[
          {
            title: t("Files"),
            key: "path",
            dataIndex: "path",
            render(text) {
              return (
                <a
                  className={"block break-words w-[420px]"}
                  onClick={() => {
                    onSelect(text);
                  }}
                >
                  <Highlighter
                    highlightClassName="YourHighlightClass"
                    searchWords={[filenameKeywords]}
                    autoEscape={true}
                    textToHighlight={text}
                  />
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
            sorter: (a, b) => {
              return a.statements.pct - b.statements.pct;
            },
            dataIndex: ["statements", "pct"],
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
        ]}
      />
    </ConfigProvider>
  );
};

export default SummaryListTable;
