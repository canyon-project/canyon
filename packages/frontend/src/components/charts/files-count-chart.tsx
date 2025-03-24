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

interface FilesCountChartProps {
  data: Commit[]
}

export default function FilesCountChart({ data }: FilesCountChartProps) {
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((commit) => ({
      date: format(parseISO(commit.date), "MM-dd"),
      files: commit.filesChanged,
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
            <div>文件数量: ${item.files}</div>
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
        name: "文件数量",
        type: "line",
        smooth: true,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(250, 173, 20, 0.5)",
              },
              {
                offset: 1,
                color: "rgba(250, 173, 20, 0.05)",
              },
            ],
          },
        },
        lineStyle: {
          width: 3,
          color: "#faad14",
        },
        itemStyle: {
          color: "#faad14",
        },
        emphasis: {
          itemStyle: {
            color: "#faad14",
            borderColor: "#fff",
            borderWidth: 2,
          },
        },
        data: chartData.map((item) => item.files),
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: 300, width: "100%" }} opts={{ renderer: "svg" }} />
}

