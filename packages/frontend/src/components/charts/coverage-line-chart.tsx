"use client"
import ReactECharts from "echarts-for-react"
import { format, parseISO } from "date-fns"

interface Commit {
  id: string
  hash: string
  date: string
  coverageRate: number
  changedLines: number
  filesChanged: number
}

interface CoverageLineChartProps {
  data: Commit[]
}

export default function CoverageLineChart({ data }: CoverageLineChartProps) {
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((commit) => ({
      date: format(parseISO(commit.date), "MM-dd"),
      coverage: commit.coverageRate,
      hash: commit.hash,
    }))

  const option = {
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex
        const item = chartData[dataIndex]
        return `
          <div>
            <div>日期: ${item.date}</div>
            <div>覆盖率: ${item.coverage}%</div>
            <div>提交: ${item.hash}</div>
          </div>
        `
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartData.map((item) => item.date),
      axisLine: {
        lineStyle: {
          color: "#ddd",
        },
      },
      axisLabel: {
        color: "#666",
      },
    },
    yAxis: {
      type: "value",
      min: (value: any) => Math.floor(value.min) - 5,
      max: (value: any) => Math.ceil(value.max) + 5,
      axisLine: {
        show: false,
      },
      axisLabel: {
        formatter: "{value}%",
        color: "#666",
      },
      splitLine: {
        lineStyle: {
          color: "#eee",
        },
      },
    },
    series: [
      {
        name: "覆盖率",
        type: "line",
        smooth: true,
        lineStyle: {
          width: 3,
          color: "#1890ff",
        },
        symbol: "circle",
        symbolSize: 8,
        itemStyle: {
          color: "#1890ff",
        },
        emphasis: {
          itemStyle: {
            color: "#1890ff",
            borderColor: "#fff",
            borderWidth: 2,
          },
        },
        data: chartData.map((item) => item.coverage),
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: 300, width: "100%" }} opts={{ renderer: "svg" }} />
}

