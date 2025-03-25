"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import ReactECharts from "echarts-for-react"
import type { EChartsOption } from "echarts"
import { theme } from "antd"

interface CoverageDataPoint {
  date: string
  coverage: number
  changedLinesCoverage: number
}

interface CoverageChartProps {
  data: CoverageDataPoint[]
}

const CoverageChart: React.FC<CoverageChartProps> = ({ data }) => {
  const { token } = theme.useToken()
  const chartRef = useRef<ReactECharts>(null)

  useEffect(() => {
    const handleResize = () => {
      chartRef.current?.getEchartsInstance().resize()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const getOption = (): EChartsOption => {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: token.colorPrimary,
          },
        },
      },
      legend: {
        data: ["Coverage Rate", "Changed Lines Coverage Rate"],
        bottom: 0,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "10%",
        top: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data.map((item) => item.date),
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: "{value}%",
        },
        min: 0,
        max: 100,
      },
      series: [
        {
          name: "Coverage Rate",
          type: "line",
          data: data.map((item) => item.coverage),
          smooth: true,
          lineStyle: {
            width: 3,
            color: token.colorPrimary,
          },
          symbol: "circle",
          symbolSize: 8,
          itemStyle: {
            color: token.colorPrimary,
          },
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
                  color: token.colorPrimary + "80", // 50% opacity
                },
                {
                  offset: 1,
                  color: token.colorPrimary + "10", // 10% opacity
                },
              ],
            },
          },
        },
        {
          name: "Changed Lines Coverage Rate",
          type: "line",
          data: data.map((item) => item.changedLinesCoverage),
          smooth: true,
          lineStyle: {
            width: 3,
            color: token.colorSuccess,
          },
          symbol: "circle",
          symbolSize: 8,
          itemStyle: {
            color: token.colorSuccess,
          },
        },
      ],
    }
  }

  return (
    <ReactECharts
      ref={chartRef}
      option={getOption()}
      style={{ height: "100%", width: "100%" }}
      notMerge={true}
      lazyUpdate={true}
    />
  )
}

export default CoverageChart

