// @ts-nocheck
import React from "react";
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
  return <div>SummaryMetric</div>;
};

const SummaryBar = () => {};

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
