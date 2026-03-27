import { DatabaseOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Descriptions, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import BasicLayout from "@/layouts/BasicLayout";
import { getDatabaseStats, type DbTableStat } from "@/services/infra";

type TableRow = DbTableStat & { key: string };

const columns: ColumnsType<TableRow> = [
  {
    title: "表名",
    dataIndex: "tableName",
    key: "tableName",
    width: 280,
  },
  {
    title: "数据量(估算)",
    dataIndex: "rowEstimate",
    key: "rowEstimate",
    width: 160,
    sorter: (a, b) => a.rowEstimate - b.rowEstimate,
    render: (v: number) => v.toLocaleString(),
  },
  {
    title: "总大小",
    dataIndex: "totalSizePretty",
    key: "totalSizePretty",
    width: 140,
    sorter: (a, b) => a.totalBytes - b.totalBytes,
  },
  {
    title: "表数据",
    dataIndex: "tableSizePretty",
    key: "tableSizePretty",
    width: 140,
    sorter: (a, b) => a.tableBytes - b.tableBytes,
  },
  {
    title: "索引",
    dataIndex: "indexSizePretty",
    key: "indexSizePretty",
    width: 140,
    sorter: (a, b) => a.indexBytes - b.indexBytes,
  },
];

const DatabasePage = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [totals, setTotals] = useState<{
    tableCount: number;
    rowEstimate: number;
    totalBytes: number;
    totalSizePretty: string;
  }>({
    tableCount: 0,
    rowEstimate: 0,
    totalBytes: 0,
    totalSizePretty: "0 MB",
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getDatabaseStats();
      setRows(data.tables.map((item) => ({ ...item, key: item.tableName })));
      setTotals(data.totals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <BasicLayout>
      <div className="py-4">
        <div className="mb-4 flex items-center justify-between">
          <Typography.Title level={4} className="mb-0 flex items-center gap-2">
            <DatabaseOutlined />
            数据库概览
          </Typography.Title>
          <Button icon={<ReloadOutlined />} onClick={fetchStats} loading={loading}>
            刷新
          </Button>
        </div>

        <Card className="mb-4" title="总体信息">
          <Descriptions column={3} size="small">
            <Descriptions.Item label="表数量">{totals.tableCount}</Descriptions.Item>
            <Descriptions.Item label="总数据量(估算)">
              {totals.rowEstimate.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="总空间">{totals.totalSizePretty}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="表明细">
          <Table
            loading={loading}
            columns={columns}
            dataSource={rows}
            pagination={{ pageSize: 20, showSizeChanger: false }}
            scroll={{ x: 920 }}
          />
        </Card>
      </div>
    </BasicLayout>
  );
};

export default DatabasePage;
