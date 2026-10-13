import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Descriptions, Space, Spin, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { fetchSnapshotTask, type SnapshotTaskView } from "../../../lib/api";

type CoverageFileRow = {
  key: string;
  path: string;
  covered: number;
  total: number;
  rate: string;
  buildHash: string;
};

const TERMINAL = new Set(["succeeded", "failed", "rejected"]);

function statusColor(status: string): string {
  switch (status) {
    case "succeeded":
      return "success";
    case "failed":
    case "rejected":
      return "error";
    case "running":
      return "processing";
    default:
      return "default";
  }
}

function toFileRows(
  coverage: SnapshotTaskView["coverage"],
): CoverageFileRow[] {
  if (!coverage) {
    return [];
  }
  return Object.entries(coverage).map(([path, entry]) => {
    const values = Object.values(entry.s ?? {});
    const total = values.length;
    const covered = values.filter((n) => n > 0).length;
    const rate = total === 0 ? "-" : `${((covered / total) * 100).toFixed(1)}%`;
    return {
      key: path,
      path: entry.path ?? path,
      covered,
      total,
      rate,
      buildHash: entry.buildHash,
    };
  });
}

export default function SnapshotTaskPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<SnapshotTaskView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!taskId) {
      return;
    }
    try {
      const view = await fetchSnapshotTask(taskId);
      setTask(view);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void load();
  }, [load]);

  // 未完成时轮询
  useEffect(() => {
    if (!task || TERMINAL.has(task.status)) {
      return;
    }
    const timer = window.setInterval(() => {
      void load();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [task, load]);

  const fileRows = useMemo(() => toFileRows(task?.coverage ?? null), [task?.coverage]);

  const columns: ColumnsType<CoverageFileRow> = [
    { title: "文件", dataIndex: "path", key: "path", ellipsis: true },
    { title: "已覆盖语句", dataIndex: "covered", key: "covered", width: 110 },
    { title: "语句总数", dataIndex: "total", key: "total", width: 100 },
    { title: "覆盖率", dataIndex: "rate", key: "rate", width: 90 },
  ];

  if (!taskId) {
    return <Alert type="error" message="缺少 taskId" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Space className="mb-2">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/coverage")}
            >
              返回 Coverage
            </Button>
          </Space>
          <Typography.Title level={3} className="!mb-1">
            快照任务
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="!mb-0">
            查看任务状态与聚合结果（语句覆盖率 s）。执行阶段默认会 sleep 约 10 秒。
          </Typography.Paragraph>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => void load()}>
          刷新
        </Button>
      </div>

      {error ? <Alert type="error" message={error} showIcon /> : null}

      <Card>
        {loading && !task ? (
          <div className="flex justify-center py-10">
            <Spin tip="加载中..." />
          </div>
        ) : task ? (
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="taskId">
              <Typography.Text code copyable>
                {task.taskId}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="buildHash">
              <Typography.Text code copyable>
                {task.buildHash}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColor(task.status)}>{task.status}</Tag>
              {!TERMINAL.has(task.status) ? (
                <Typography.Text type="secondary" className="ml-2">
                  进行中，自动刷新中…
                </Typography.Text>
              ) : null}
            </Descriptions.Item>
            <Descriptions.Item label="tag 筛选">
              {task.tagFilter ? (
                <Typography.Text code>{JSON.stringify(task.tagFilter)}</Typography.Text>
              ) : (
                "全部 tag"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="snapshotId">
              {task.snapshotId ? (
                <Typography.Text code copyable>
                  {task.snapshotId}
                </Typography.Text>
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="错误">{task.error ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(task.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="开始时间">
              {task.startedAt ? new Date(task.startedAt).toLocaleString() : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="结束时间">
              {task.finishedAt ? new Date(task.finishedAt).toLocaleString() : "-"}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Card>

      {task?.status === "succeeded" ? (
        <Card title="快照结果（按文件）">
          <Table
            rowKey="key"
            size="small"
            columns={columns}
            dataSource={fileRows}
            pagination={{ pageSize: 50 }}
          />
          <Typography.Title level={5} className="!mt-6">
            原始 JSON
          </Typography.Title>
          <pre className="max-h-[420px] overflow-auto rounded bg-neutral-50 p-3 text-xs">
            {JSON.stringify(task.coverage, null, 2)}
          </pre>
        </Card>
      ) : null}
    </div>
  );
}
