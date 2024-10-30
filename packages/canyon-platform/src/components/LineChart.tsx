import EChartsReact from "echarts-for-react";
import { CanyonCardPrimary } from "@/components/old-ui";

const coreData = [
  {
    month: 0,
    year: 2024,
    uiTestBranchCoverage: 50.59,
    uiTestLineCoverage: 56.08,
    uiTestChangedLineCoverage: 100,
    utBranchCoverage: 64.96,
    utLineCoverage: 62.56,
  },
  {
    month: 1,
    year: 2024,
    uiTestBranchCoverage: 51.45,
    uiTestLineCoverage: 59.19,
    uiTestChangedLineCoverage: 93.76,
    utBranchCoverage: 64.74,
    utLineCoverage: 64,
  },
  {
    month: 2,
    year: 2024,
    uiTestBranchCoverage: 50.05,
    uiTestLineCoverage: 63.23,
    uiTestChangedLineCoverage: 93.95,
    utBranchCoverage: 64.68,
    utLineCoverage: 64.38,
  },
  {
    month: 3,
    year: 2024,
    uiTestBranchCoverage: 55.15,
    uiTestLineCoverage: 66.47,
    uiTestChangedLineCoverage: 95.49,
    utBranchCoverage: 64.62,
    utLineCoverage: 65.61,
  },
  {
    month: 4,
    year: 2024,
    uiTestBranchCoverage: 57.84,
    uiTestLineCoverage: 71.61,
    uiTestChangedLineCoverage: 95.1,
    utBranchCoverage: 64.69,
    utLineCoverage: 66.15,
  },
  {
    month: 5,
    year: 2024,
    uiTestBranchCoverage: 62.84,
    uiTestLineCoverage: 77.23,
    uiTestChangedLineCoverage: 96.13,
    utBranchCoverage: 65.21,
    utLineCoverage: 68.91,
  },
  {
    month: 6,
    year: 2024,
    uiTestBranchCoverage: 63.22,
    uiTestLineCoverage: 77.66,
    uiTestChangedLineCoverage: 95.35,
    utBranchCoverage: 66.81,
    utLineCoverage: 69.34,
  },
  {
    month: 7,
    year: 2024,
    uiTestBranchCoverage: 63.43,
    uiTestLineCoverage: 77.92,
    uiTestChangedLineCoverage: 95.61,
    utBranchCoverage: 67.1,
    utLineCoverage: 69.83,
  },
  {
    month: 8,
    year: 2024,
    uiTestBranchCoverage: 63.5,
    uiTestLineCoverage: 78.11,
    uiTestChangedLineCoverage: 95.33,
    utBranchCoverage: 67.9,
    utLineCoverage: 70.21,
    codeChangeNum: 951122,
  },
  {
    month: 9,
    year: 2024,
    uiTestBranchCoverage: 63.35,
    uiTestLineCoverage: 77.91,
    uiTestChangedLineCoverage: 95.31,
    utBranchCoverage: 67.68,
    utLineCoverage: 69.97,
    codeChangeNum: 935567,
  },
];

const data = {
  Month: coreData.map((item) => `${item.month + 1}月`),
  "Branch Coverage (%)": coreData.map((item) => item.uiTestBranchCoverage),
  "Line Coverage (%)": coreData.map((item) => item.uiTestLineCoverage),
  "Changed Line Coverage (%)": coreData.map(
    (item) => item.uiTestChangedLineCoverage,
  ),
};
const d1 = coreData.map((item) => item.utBranchCoverage);
const d2 = coreData.map((item) => item.utLineCoverage);
const data1 = {
  Month: coreData.map((item) => `${item.month + 1}月`),
  "Branch Coverage (%)": d1,
  "Line Coverage (%)": d2,
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
  // toolbox: {
  //   feature: {
  //     saveAsImage: {},
  //   },
  // },
  xAxis: {
    type: "category",
    boundaryGap: true,
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
      //   线上加文字
      label: {
        show: true,
        position: "bottom",
      },
    },
    {
      name: "Line Coverage (%)",
      type: "line",
      data: data["Line Coverage (%)"],
      //   线上加文字
      label: {
        show: true,
        position: "top",
      },
    },
    {
      name: "Changed Line Coverage (%)",
      type: "line",
      data: data["Changed Line Coverage (%)"],
      //   线上加文字
      label: {
        show: true,
        position: "top",
      },
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
  // toolbox: {
  //   feature: {
  //     saveAsImage: {},
  //   },
  // },
  xAxis: {
    type: "category",
    boundaryGap: true,
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
      label: {
        show: true,
        position: "top",
        color: "blue",
      },
    },
    {
      name: "Line Coverage (%)",
      type: "line",
      data: data1["Line Coverage (%)"],
      label: {
        show: true,
        position: "bottom",
        color: "green",
      },
    },
  ],
};
const LineChart = () => {
  return (
    <CanyonCardPrimary>
      <div className={"flex items-center bg-white dark:bg-[#0F0D28] p-5"}>
        <EChartsReact
          className={"w-[50%]"}
          style={{ height: "400px" }}
          option={option}
        />
        <EChartsReact
          className={"w-[50%]"}
          style={{ height: "400px" }}
          option={option1}
        />
      </div>
    </CanyonCardPrimary>
  );
};

export default LineChart;
