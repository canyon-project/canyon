import EChartsReact from "echarts-for-react";
const data = {
  Month: ["1月", "2月", "3月", "4月", "5月", "6月"],
  "Branch Coverage (%)": [50.59, 51.45, 50.05, 55.15, 57.84, 62.84],
  "Line Coverage (%)": [66.08, 67.18, 64.81, 68.7, 71.82, 76.37, 74.99],
  "Changed Line Coverage (%)": [null, 93.76, 93.95, 95.49, 95.1, 96.13],
};
const d1 = [58.93, 59.07, 58.86, 58.93, 58.73, 59.04];
const d2 = [40.94, 42.18, 41.71, 42.13, 42.69, 44.37];
const data1 = {
  Month: ["1月", "2月", "3月", "4月", "5月", "6月"],
  "Branch Coverage (%)": d1,
  "Line Coverage (%)": d2,
  "Changed Line Coverage (%)": [null, 93.76, 93.95, 95.49, 95.1, 96.13],
};

const option = {
  title: {
    text: "UI自动化覆盖率",
  },
  tooltip: {
    trigger: "axis",
  },
  legend: {
    data: [
      "Branch Coverage (%)",
      "Line Coverage (%)",
      "Changed Line Coverage (%)",
    ],
    right: 10,
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  toolbox: {
    feature: {
      saveAsImage: {},
    },
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: data.Month,
  },
  yAxis: {
    type: "value",
    max: 100,
  },
  series: [
    {
      name: "Branch Coverage (%)",
      type: "line",
      data: data["Branch Coverage (%)"],
    },
    {
      name: "Line Coverage (%)",
      type: "line",
      data: data["Line Coverage (%)"],
    },
    {
      name: "Changed Line Coverage (%)",
      type: "line",
      data: data["Changed Line Coverage (%)"],
    },
  ],
};

const option1 = {
  title: {
    text: "UT覆盖率",
  },
  tooltip: {
    trigger: "axis",
  },
  legend: {
    data: [
      "Branch Coverage (%)",
      "Line Coverage (%)",
      "Changed Line Coverage (%)",
    ],
    right: 10,
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  toolbox: {
    feature: {
      saveAsImage: {},
    },
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: data.Month,
  },
  yAxis: {
    type: "value",
    max: 100,
  },
  series: [
    {
      name: "Branch Coverage (%)",
      type: "line",
      data: data1["Branch Coverage (%)"],
    },
    {
      name: "Line Coverage (%)",
      type: "line",
      data: data1["Line Coverage (%)"],
    },
  ],
};
const Test = () => {
  return (
    <div>
      <EChartsReact
        className={"w-[700px]"}
        style={{ height: "300px" }}
        option={option}
      />
      <EChartsReact
        className={"w-[700px]"}
        style={{ height: "300px" }}
        option={option1}
      />
    </div>
  );
};

export default Test;
