import React, { FC } from "react";
import { Tag, Typography } from "antd";
import { getColor } from "../../helpers";
const { Text } = Typography;
const SummaryNav: FC<{
  value: string;
  onClick: (value: string) => void;
}> = ({ value, onClick }) => {
  console.log(value, "value");
  return (
    <div
      className={"flex gap-1"}
      style={{ fontSize: "16px", fontWeight: "bold" }}
    >
      {("canyon/" + value).split("/").map((item, index) => {
        return (
          <div key={index} className={"flex gap-1"}>
            <button
              className={"text-blue-500 cursor-pointer hover:underline"}
              key={index}
              onClick={() => {
                onClick(value.split("/").slice(0, index).join("/"));
              }}
            >
              {item}
            </button>
            {index === value.split("/").length ? null : <span>/</span>}
          </div>
        );
      })}
    </div>
  );
};

const SummaryMetric = () => {
  const t = (key) => key;
  const summaryTreeItem = {
    summary: {
      files: { total: 1, covered: 1, pct: 100 },
      functions: { total: 1, covered: 1, pct: 100 },
      lines: { total: 1, covered: 1, pct: 100 },
      branches: { total: 1, covered: 1, pct: 100 },
    },
  };

  return (
    <div>
      <div className={"flex gap-2 mb-3"}>
        {Object.entries(summaryTreeItem.summary).map(([key, value]) => {
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

const SummaryBar = () => {
  return (
    <div
      style={{
        backgroundColor: getColor(75),
      }}
      className={"w-full h-[10px] mb-3"}
    />
  );
};

const SummaryHeader = ({ value, onSelect }) => {
  console.log(value, "value");
  return (
    <div>
      <SummaryNav value={value} onClick={onSelect} />
      <SummaryMetric />
      <SummaryBar />
    </div>
  );
};

export default SummaryHeader;
