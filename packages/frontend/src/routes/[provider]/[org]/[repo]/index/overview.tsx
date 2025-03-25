

"use client"

import { useState, useEffect } from "react"
import { Card, Row, Col, Statistic, Typography, Spin } from "antd"
import { ArrowUpOutlined, ClockCircleOutlined, CheckCircleOutlined, BarChartOutlined } from "@ant-design/icons"
import CoverageChart from "@/components/coverage-chart"
import { fetchCoverageData } from "@/lib/api"

const { Title } = Typography

export default function CoverageOverview() {
  const [loading, setLoading] = useState(true)
  const [coverageData, setCoverageData] = useState({
    totalCount: 0,
    maxCoverage: 0,
    latestReportTime: "",
    latestCoverage: 0,
    chartData: [],
  })

  useEffect(() => {
    const getData = async () => {
      try {
        // In a real app, this would fetch from your API
        const data = await fetchCoverageData()
        setCoverageData(data)
      } catch (error) {
        console.error("Failed to fetch coverage data:", error)
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <Title level={2}>Coverage Overview</Title>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="h-full">
            <Statistic
              title="Total Count"
              value={coverageData.totalCount}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="h-full">
            <Statistic
              title="Maximum Coverage"
              value={coverageData.maxCoverage}
              precision={2}
              valueStyle={{ color: "#3f8600" }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="h-full">
            <Statistic
              title="Latest Report Time"
              value={coverageData.latestReportTime}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="h-full">
            <Statistic
              title="Latest Coverage"
              value={coverageData.latestCoverage}
              precision={2}
              valueStyle={{ color: "#cf1322" }}
              prefix={<CheckCircleOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="w-full">
        <Title level={4}>Coverage Trend</Title>
        <div className="h-[400px]">
          <CoverageChart data={coverageData.chartData} />
        </div>
      </Card>
    </div>
  )
}

