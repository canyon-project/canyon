import { Table, Progress, ConfigProvider } from "antd";
import React, { FC } from "react";
import Highlighter from "react-highlight-words";
// import { getColor } from "../../helpers";
import { CoverageSummaryData } from "istanbul-lib-coverage";
import { getColor } from "../helpers";
import { css } from "@emotion/react";

const t = (msg: string) => msg;
const SummaryListTable: FC<{
  dataSource: (CoverageSummaryData & { path: string })[];
  onSelect: (path: string) => void;
  filenameKeywords: string;
  style?: React.CSSProperties;
}> = ({ dataSource, onSelect, filenameKeywords, style }) => {
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
          bordered={true}
          pagination={{
            defaultPageSize: 15,
          }}
          size={"small"}
          dataSource={dataSource}
          rowKey={"path"}
          columns={[
            {
              title: t("Files"),
              key: "path",
              dataIndex: "path",
              render(text) {
                return (
                  <a
                    css={css`
                      width: 420px;
                      display: block;
                      overflow-wrap: break-word;
                    `}
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

export default SummaryListTable;
