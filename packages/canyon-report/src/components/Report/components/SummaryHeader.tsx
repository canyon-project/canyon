import React, { FC } from "react";
import { Tag, Typography } from "antd";
import { getColor } from "../../helpers";
import { CoverageSummaryData } from "istanbul-lib-coverage";
const { Text } = Typography;
const SummaryNav: FC<{
  reportName: string;
  value: string;
  onClick: (value: string) => void;
}> = ({ value, onClick, reportName }) => {
  console.log(value, "value");
  return (
    <div
      className={"flex gap-1"}
      style={{ fontSize: "16px", fontWeight: "bold" }}
    >
      {(reportName + "/" + value).split("/").map((item, index) => {
        return (
          <div key={index} className={"flex gap-1"}>
            <a
              className={"text-blue-500 cursor-pointer hover:underline"}
              key={index}
              onClick={() => {
                onClick(value.split("/").slice(0, index).join("/"));
              }}
            >
              {item}
            </a>
            {index === value.split("/").length || !value ? null : (
              <span>/</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const SummaryMetric: FC<{
  data: CoverageSummaryData & { path: string };
}> = ({ data }) => {
  const t = (key: string) => key;
  const summaryTreeItem = {
    summary: data,
  };

  return (
    <div>
      <div className={"flex gap-2 mb-3"}>
        {Object.entries(summaryTreeItem.summary)
          .filter(([key]) =>
            ["statements", "branches", "functions", "lines"].includes(key),
          )
          .map(([key, value]) => {
            return (
              <div className={"flex gap-1 items-center"} key={key}>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>
                  {value.pct}%
                </span>
                <Text style={{ fontSize: "14px" }} type={"secondary"}>
                  {t(key)}:
                </Text>
                <Tag bordered={false}>
                  {value.covered}/{value.total}
                </Tag>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const SummaryBar: FC<{ pct: number }> = ({ pct }) => {
  return (
    <div
      style={{
        backgroundColor: getColor(pct),
      }}
      className={"w-full h-[10px] mb-3"}
    />
  );
};

const SummaryHeader: FC<{
  value: string;
  onSelect: (value: string) => void;
  data: CoverageSummaryData & { path: string };
  reportName: string;
}> = ({ value, onSelect, data, reportName }) => {
  return (
    <div>
      <SummaryNav reportName={reportName} value={value} onClick={onSelect} />
      <SummaryMetric data={data} />
      <SummaryBar pct={data.statements.pct} />
    </div>
  );
};

export default SummaryHeader;
