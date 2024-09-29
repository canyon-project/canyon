import { Table, Progress, ConfigProvider } from "antd";
import React from "react";
import Highlighter from "react-highlight-words";
import { getColor } from "../../helpers";

// import { getCOlor, percent } from "../helper";
const t = (msg) => msg;
const SummaryListTable = ({ dataSource, onSelect, value }) => {
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
                    onSelect(text).then((res) => {
                      console.log(res);
                    });
                  }}
                >
                  <Highlighter
                    highlightClassName="YourHighlightClass"
                    searchWords={["keywords"]}
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
        ].concat([
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
        ])}
      />
    </ConfigProvider>
  );
};

export default SummaryListTable;
