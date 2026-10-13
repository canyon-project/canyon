import { EyeOutlined, CameraOutlined, ReloadOutlined, UnorderedListOutlined } from "@ant-design/icons";
import {
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createSnapshot,
  fetchCoverageBuilds,
  fetchSnapshotTasksByBuild,
  type CoverageBuild,
  type CoverageTagSummary,
  type SnapshotTaskSummary,
} from "../../lib/api";

function shortHash(value: string, head = 8): string {
  if (value.length <= head + 4) {
    return value;
  }
  return `${value.slice(0, head)}…`;
}

function formatTagLabel(tag: CoverageTagSummary["tag"]): string {
  const parts = [tag.source, tag.type, tag.env, tag.trigger].filter(
    (v) => typeof v === "string" && v.length > 0,
  );
  return parts.length > 0 ? parts.join(" / ") : "(空 tag)";
}

export default function CoveragePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<CoverageBuild[]>([]);
  const [tagDrawer, setTagDrawer] = useState<CoverageBuild | null>(null);
  const [taskDrawer, setTaskDrawer] = useState<CoverageBuild | null>(null);
  const [tasks, setTasks] = useState<SnapshotTaskSummary[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [snapshotTarget, setSnapshotTarget] = useState<CoverageBuild | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm<{ source?: string; type?: string; env?: string; trigger?: string }>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items } = await fetchCoverageBuilds();
      setRows(items);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openTasks = async (record: CoverageBuild) => {
    setTaskDrawer(record);
    setTasksLoading(true);
    try {
      const { items } = await fetchSnapshotTasksByBuild(record.buildHash);
      setTasks(items);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "加载任务失败");
    } finally {
      setTasksLoading(false);
    }
  };

  const submitSnapshot = async () => {
    if (!snapshotTarget) {
      return;
    }
    const values = await form.validateFields();
    const tag: Record<string, string> = {};
    for (const key of ["source", "type", "env", "trigger"] as const) {
      const v = values[key]?.trim();
      if (v) {
        tag[key] = v;
      }
    }

    setCreating(true);
    try {
      const result = await createSnapshot(
        snapshotTarget.buildHash,
        Object.keys(tag).length > 0 ? tag : undefined,
      );
      message.success("快照任务已创建（执行中约等待 10 秒）");
      setSnapshotTarget(null);
      form.resetFields();
      navigate(`/coverage/snapshot/${result.taskId}`);
    } catch (err) {
      const e = err as Error & { status?: number; body?: { taskId?: string } };
      if (e.status === 409 && e.body?.taskId) {
        message.warning("已有任务在执行，跳转到该任务");
        setSnapshotTarget(null);
        navigate(`/coverage/snapshot/${e.body.taskId}`);
        return;
      }
      message.error(e.message || "创建失败");
    } finally {
      setCreating(false);
    }
  };

  const columns: ColumnsType<CoverageBuild> = [
    {
      title: "buildHash",
      dataIndex: "buildHash",
      key: "buildHash",
      width: 160,
      render: (v: string) => (
        <Typography.Text code copyable={{ text: v }}>
          {shortHash(v)}
        </Typography.Text>
      ),
    },
    {
      title: "仓库",
      key: "repo",
      ellipsis: true,
      render: (_, r) => (
        <span>
          {r.provider || "-"} / {r.repoId || "-"}
        </span>
      ),
    },
    {
      title: "sha",
      dataIndex: "sha",
      key: "sha",
      width: 120,
      render: (v: string) => (v ? <Typography.Text code>{shortHash(v, 7)}</Typography.Text> : "-"),
    },
    {
      title: "文件数",
      dataIndex: "fileCount",
      key: "fileCount",
      width: 80,
    },
    {
      title: "Hit 行数",
      dataIndex: "hitCount",
      key: "hitCount",
      width: 90,
    },
    {
      title: "Tag",
      key: "tags",
      width: 220,
      render: (_, r) =>
        r.tagCount === 0 ? (
          <Typography.Text type="secondary">无</Typography.Text>
        ) : (
          <Space size={[4, 4]} wrap>
            <Tag color="blue">{r.tagCount} 种 tagKey</Tag>
            {r.tags.slice(0, 2).map((t) => (
              <Tag key={t.tagKey}>{formatTagLabel(t.tag)}</Tag>
            ))}
            {r.tags.length > 2 ? <Tag>+{r.tags.length - 2}</Tag> : null}
          </Space>
        ),
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 280,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<CameraOutlined />}
            onClick={() => {
              form.resetFields();
              setSnapshotTarget(record);
            }}
          >
            生成快照
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            disabled={record.tagCount === 0}
            onClick={() => setTagDrawer(record)}
          >
            查看 Tag
          </Button>
          <Button
            type="link"
            size="small"
            icon={<UnorderedListOutlined />}
            onClick={() => void openTasks(record)}
          >
            任务
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Title level={3} className="!mb-1">
            Coverage
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="!mb-0">
            按 buildHash 查看覆盖率数据、Tag，并创建快照任务。
          </Typography.Paragraph>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => void load()} loading={loading}>
          刷新
        </Button>
      </div>

      <Table
        rowKey="buildHash"
        loading={loading}
        columns={columns}
        dataSource={rows}
        scroll={{ x: 1100 }}
        pagination={{ pageSize: 20 }}
      />

      <Drawer
        title={tagDrawer ? `Tag 列表 · ${shortHash(tagDrawer.buildHash)}` : "Tag"}
        open={Boolean(tagDrawer)}
        onClose={() => setTagDrawer(null)}
        width={520}
      >
        <Table
          rowKey="tagKey"
          size="small"
          pagination={false}
          dataSource={tagDrawer?.tags ?? []}
          columns={[
            {
              title: "tagKey",
              dataIndex: "tagKey",
              render: (v: string) => (
                <Typography.Text code copyable={{ text: v }}>
                  {shortHash(v, 10)}
                </Typography.Text>
              ),
            },
            {
              title: "tag",
              dataIndex: "tag",
              render: (tag: CoverageTagSummary["tag"]) => formatTagLabel(tag),
            },
            {
              title: "详情",
              key: "detail",
              render: (_, r) => (
                <Typography.Paragraph
                  className="!mb-0"
                  code
                  copyable
                  style={{ whiteSpace: "pre-wrap", fontSize: 12 }}
                >
                  {JSON.stringify(r.tag, null, 2)}
                </Typography.Paragraph>
              ),
            },
          ]}
        />
      </Drawer>

      <Drawer
        title={taskDrawer ? `快照任务 · ${shortHash(taskDrawer.buildHash)}` : "任务"}
        open={Boolean(taskDrawer)}
        onClose={() => setTaskDrawer(null)}
        width={560}
      >
        <Table
          rowKey="taskId"
          size="small"
          loading={tasksLoading}
          pagination={false}
          dataSource={tasks}
          columns={[
            {
              title: "任务",
              dataIndex: "taskId",
              render: (v: string) => (
                <Typography.Link onClick={() => navigate(`/coverage/snapshot/${v}`)}>
                  {shortHash(v, 10)}
                </Typography.Link>
              ),
            },
            {
              title: "状态",
              dataIndex: "status",
              render: (s: string) => <Tag>{s}</Tag>,
            },
            {
              title: "创建时间",
              dataIndex: "createdAt",
              render: (v: string) => new Date(v).toLocaleString(),
            },
          ]}
        />
      </Drawer>

      <Modal
        title="生成快照"
        open={Boolean(snapshotTarget)}
        onCancel={() => setSnapshotTarget(null)}
        onOk={() => void submitSnapshot()}
        confirmLoading={creating}
        okText="创建任务"
        destroyOnHidden
      >
        <Typography.Paragraph type="secondary">
          buildHash: <Typography.Text code>{snapshotTarget?.buildHash}</Typography.Text>
          <br />
          不填筛选项则聚合该 build 下全部 tag。任务执行过程会额外 sleep 约 10 秒。
        </Typography.Paragraph>
        <Form form={form} layout="vertical">
          <Form.Item name="source" label="source">
            <Input placeholder="可选，如 manual" allowClear />
          </Form.Item>
          <Form.Item name="type" label="type">
            <Input placeholder="可选，如 e2e" allowClear />
          </Form.Item>
          <Form.Item name="env" label="env">
            <Input placeholder="可选，如 test" allowClear />
          </Form.Item>
          <Form.Item name="trigger" label="trigger">
            <Input placeholder="可选，如 ci" allowClear />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
