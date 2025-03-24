"use client"

import { Table } from "antd"
import { format, parseISO } from "date-fns"
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons"

interface Commit {
  id: string
  hash: string
  author: string
  message: string
  date: string
  coverageRate: number
  changedLines: number
  filesChanged: number
}

interface CommitTableProps {
  data: Commit[]
}

export default function CommitTable({ data }: CommitTableProps) {
  // Sort data by date (newest first)
  const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Determine coverage trend
  const withTrends = sortedData.map((commit, index, array) => {
    if (index === array.length - 1) {
      return { ...commit, trend: 0 }
    }
    const prevCoverage = array[index + 1].coverageRate
    const trend = commit.coverageRate - prevCoverage
    return { ...commit, trend }
  })

  const columns = [
    {
      title: "提交",
      dataIndex: "hash",
      key: "hash",
      render: (text: string) => <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{text}</span>,
    },
    {
      title: "作者",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "描述",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
      render: (text: string) => format(parseISO(text), "yyyy-MM-dd"),
    },
    {
      title: "覆盖率",
      dataIndex: "coverageRate",
      key: "coverageRate",
      align: "right" as const,
      render: (text: number, record: any) => (
        <span>
          {record.trend > 0 && <ArrowUpOutlined style={{ color: "#52c41a", marginRight: 8 }} />}
          {record.trend < 0 && <ArrowDownOutlined style={{ color: "#f5222d", marginRight: 8 }} />}
          {text}%
        </span>
      ),
      sorter: (a: any, b: any) => a.coverageRate - b.coverageRate,
    },
    {
      title: "变更行数",
      dataIndex: "changedLines",
      key: "changedLines",
      align: "right" as const,
      sorter: (a: any, b: any) => a.changedLines - b.changedLines,
    },
    {
      title: "文件数",
      dataIndex: "filesChanged",
      key: "filesChanged",
      align: "right" as const,
      sorter: (a: any, b: any) => a.filesChanged - b.filesChanged,
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={withTrends}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      scroll={{ x: "max-content" }}
    />
  )
}

