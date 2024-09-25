// @ts-nocheck
import { Table, Progress } from "antd";
import React from "react";
import Highlighter from "react-highlight-words";

// import { getCOlor, percent } from "../helper";
const t = (msg) => msg;
const SummaryListTable = ({ dataSource, onSelect }) => {
  return (
    <div>
      <Table
        bordered={true}
        pagination={{
          defaultPageSize: 15,
        }}
        size={"small"}
        dataSource={dataSource}
        columns={[
          {
            title: t("projects.detail.files"),
            key: "path",
            dataIndex: "path",
            // width: '200px',
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
            title: t("common.total"),
            key: "total",
            dataIndex: ["statements", "total"],
            sorter(a, b) {
              return a.statements.total - b.statements.total;
            },
          },
          {
            title: t("common.covered"),
            key: "covered",
            dataIndex: ["statements", "covered"],
            sorter(a, b) {
              return a.statements.covered - b.statements.covered;
            },
          },
        ].concat([
          {
            title: t("projects.config.coverage") + " %",
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
                  strokeColor={"green"}
                  className={"pr-5"}
                  status={"normal"}
                />
              );
            },
          },
        ])}
      />
    </div>
  );
};

export default SummaryListTable;
