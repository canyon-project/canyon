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

interface ChangedLinesChartProps {
  data: Commit[]
}

export default function ChangedLinesChart({ data }: ChangedLinesChartProps) {
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((commit) => ({
      date: format(parseISO(commit.date), "MM-dd"),
      lines: commit.changedLines,
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
            <div>变更行数: ${item.lines}</div>
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
      axisLine: {
        show: false,
      },
      axisLabel: {
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
        name: "变更行数",
        type: "bar",
        barWidth: "60%",
        itemStyle: {
          color: "#52c41a",
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: "#389e0d",
          },
        },
        data: chartData.map((item) => item.lines),
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: 300, width: "100%" }} opts={{ renderer: "svg" }} />
}

