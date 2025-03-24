"use client"

import { useState } from "react"
import { Typography, Card, Tabs, Statistic, Row, Col, DatePicker } from "antd"
import { GitCommitOutlined, CalendarOutlined } from "@ant-design/icons"
import CoverageLineChart from "@/components/charts/coverage-line-chart"
import ChangedLinesChart from "@/components/charts/changed-lines-chart"
import FilesCountChart from "@/components/charts/files-count-chart"
import CommitTable from "@/components/commit-table"
import dayjs from "dayjs"

const { Title, Paragraph } = Typography
const { RangePicker } = DatePicker
const { TabPane } = Tabs

// Mock data for demonstration
const mockData = {
  // Sample data for commits with coverage information
  commits: Array.from({ length: 20 }).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)

    return {
      id: `commit-${i}`,
      hash: Math.random().toString(16).slice(2, 10),
      author: ["李明", "张华", "王芳", "赵伟", "陈静"][Math.floor(Math.random() * 5)],
      message: ["修复登录bug", "添加新功能", "优化性能", "更新文档", "重构代码"][Math.floor(Math.random() * 5)],
      date: date.toISOString(),
      coverageRate: 65 + Math.floor(Math.random() * 20 - 5),
      changedLines: Math.floor(Math.random() * 500),
      filesChanged: Math.floor(Math.random() * 20),
    }
  }),
}

export default function CoverageDashboard() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(1, "month"), dayjs()])

  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange([dates[0], dates[1]])
    }
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="平均覆盖率"
              value={76.3}
              precision={1}
              valueStyle={{ color: "#3f8600" }}
              // prefix={<GitCommitOutlined />}
              suffix="%"
            />
            <div style={{ fontSize: 12, color: "rgba(0, 0, 0, 0.45)", marginTop: 8 }}>
              较上周 <span style={{ color: "#3f8600" }}>+2.5%</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="总变更行数"
              value={4721}
              valueStyle={{ color: "#cf1322" }}
              prefix={<CalendarOutlined />}
            />
            <div style={{ fontSize: 12, color: "rgba(0, 0, 0, 0.45)", marginTop: 8 }}>
              较上周 <span style={{ color: "#cf1322" }}>-12%</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="参与编译文件"
              value={156}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CalendarOutlined />}
            />
            <div style={{ fontSize: 12, color: "rgba(0, 0, 0, 0.45)", marginTop: 8 }}>
              较上周 <span style={{ color: "#3f8600" }}>+3</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="覆盖率变化趋势" extra="按照提交时间的覆盖率变化">
            <CoverageLineChart data={mockData.commits} />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="变更代码行趋势" extra="每次提交的代码变更量">
            <ChangedLinesChart data={mockData.commits} />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="文件数量变化趋势" extra="参与编译的文件数量变化">
            <FilesCountChart data={mockData.commits} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

