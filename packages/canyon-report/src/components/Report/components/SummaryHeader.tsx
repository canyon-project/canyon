// @ts-nocheck
import React from "react";
import { Tag, Typography } from "antd";
import {getColor} from "../../helpers";
const { Text } = Typography;
const SummaryNav = ({ value, onClick }) => {
  console.log(value, "value");
  return (
    <div className={"flex"}>
      {value.split("/").map((item, index) => {
        return (
          <div>
            <a
              className={"text-blue-500 cursor-pointer"}
              key={index}
              onClick={() => {
                onClick(
                  value
                    .split("/")
                    .slice(0, index + 1)
                    .join("/"),
                );
              }}
            >
              {item}
            </a>
            <span>/</span>
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
            <div className={"flex gap-1 items-center"}>
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
