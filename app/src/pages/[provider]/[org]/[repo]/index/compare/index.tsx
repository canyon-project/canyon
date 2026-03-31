import {
  CameraOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
  GitlabFilled,
  PlusOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  Avatar,
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOutletContext, useParams } from "react-router-dom";
import CardPrimary from "@/components/card/Primary";
import SnapshotDrawer from "@/components/snapshot/SnapshotDrawer";
import type { SnapshotFormValues } from "@/services/snapshot";
import { createDiff, deleteDiff, getDiffList } from "@/services/code";

const { Text } = Typography;

type Repo = {
  id: string;
  pathWithNamespace: string;
  description: string;
  bu: string;
  tags: string;
  members: string;
  config: string;
  createdAt: string;
  updatedAt: string;
};

type DiffFile = {
  path: string;
  additions: number[];
  deletions: number[];
};

type CommitInfo = {
  commitMessage: string;
  authorName: string | null;
  authorEmail: string | null;
  avatar?: string | null;
  createdAt: string;
};

type CompareRecord = {
  id: string;
  provider: string;
  repoID: string;
  base: string;
  head: string;
  subject: string;
  subjectID: string;
  files: DiffFile[];
  buildTargets: string[];
  compareUrl?: string | null;
  baseCommit: CommitInfo | null;
  headCommit: CommitInfo | null;
};

const ComparePage = () => {
  const { t } = useTranslation();
  const { repo } = useOutletContext<{
    repo: Repo | null;
  }>();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [compareRecords, setCompareRecords] = useState<CompareRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [snapshotDrawerOpen, setSnapshotDrawerOpen] = useState(false);
  const [snapshotDrawerMode, setSnapshotDrawerMode] = useState<"create" | "records">("create");
  const [snapshotInitialValues, setSnapshotInitialValues] = useState<Partial<SnapshotFormValues>>(
    {},
  );

  const fetchCompareRecords = async () => {
    if (!repo?.id || !params.provider) {
      return;
    }

    setLoading(true);
    try {
      const data = await getDiffList({ repoID: repo.id, provider: params.provider });
      setCompareRecords(Array.isArray(data.data) ? (data.data as CompareRecord[]) : []);
      setTotal(data.total ?? 0);
    } catch (error) {
      message.error(t("projects.comparison.fetch.failed"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompareRecords();
  }, [repo?.id, params.provider]);

  const handleAdd = async (values: { base: string; head: string }) => {
    if (!repo?.id || !params.provider) {
      return;
    }

    const subjectID = `${values.base}...${values.head}`;
    const subject = "compare";

    setAddLoading(true);
    try {
      await createDiff({
        repoID: repo.id,
        provider: params.provider,
        subject,
        subjectID,
      });
      message.success(t("projects.comparison.create.success"));
      setIsModalOpen(false);
      form.resetFields();
      fetchCompareRecords();
    } catch (error) {
      message.error(t("projects.comparison.create.failed"));
      console.error(error);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (record: CompareRecord) => {
    if (!repo?.id || !params.provider) {
      return;
    }

    try {
      await deleteDiff({
        repoID: repo.id,
        provider: params.provider,
        subjectID: record.subjectID,
        subject: record.subject,
      });
      message.success(t("projects.comparison.delete.success"));
      fetchCompareRecords();
    } catch (error) {
      message.error(t("projects.comparison.delete.failed"));
      console.error(error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const lng = localStorage.getItem("language") || "en";
      const localeMap: Record<string, string> = {
        cn: "zh-CN",
        en: "en-US",
        ja: "ja-JP",
      };
      return date.toLocaleString(localeMap[lng] || "en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const columns: ColumnsType<CompareRecord> = [
    {
      title: t("projects.comparison.columns.base"),
      dataIndex: "base",
      key: "base",
      width: 180,
      render: (text: string, record: CompareRecord) => {
        const commitInfo = record.baseCommit;
        const shortSha = text ? text.substring(0, 7) : "-";
        const commitMessage = commitInfo?.commitMessage
          ? commitInfo.commitMessage.split("\n")[0].substring(0, 60)
          : null;
        const author = commitInfo?.authorName || commitInfo?.authorEmail || null;
        const email = commitInfo?.authorEmail || null;
        const createdAt = commitInfo?.createdAt ? formatDate(commitInfo.createdAt) : null;

        return (
          <div>
            <Text code style={{ fontSize: "12px" }}>
              {shortSha}
            </Text>
            {text && (
              <Tooltip title={t("common.copy")}>
                <CopyOutlined
                  style={{ marginLeft: 6, color: "#999", cursor: "pointer" }}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(text);
                      message.success(t("common.copied"));
                    } catch {
                      message.error(t("common.copy_failed"));
                    }
                  }}
                />
              </Tooltip>
            )}
            {commitMessage && commitInfo && (
              <div style={{ fontSize: "12px", marginTop: "4px", color: "#666" }}>
                <Tooltip title={commitInfo.commitMessage}>
                  {commitMessage}
                  {commitInfo.commitMessage.length > 60 ? "..." : ""}
                </Tooltip>
              </div>
            )}
            {author && (
              <div style={{ fontSize: "11px", marginTop: "2px", color: "#999" }}>
                <Space size={4}>
                  {commitInfo?.avatar ? (
                    <Avatar src={commitInfo.avatar} size={18} />
                  ) : (
                    <Avatar size={18} icon={<UserOutlined />} />
                  )}
                  <span>
                    {author}
                    {email && author !== email && ` (${email})`}
                    {createdAt && ` · ${createdAt}`}
                  </span>
                </Space>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: t("projects.comparison.columns.head"),
      dataIndex: "head",
      key: "head",
      width: 180,
      render: (text: string, record: CompareRecord) => {
        const commitInfo = record.headCommit;
        const shortSha = text ? text.substring(0, 7) : "-";
        const commitMessage = commitInfo?.commitMessage
          ? commitInfo.commitMessage.split("\n")[0].substring(0, 60)
          : null;
        const author = commitInfo?.authorName || commitInfo?.authorEmail || null;
        const email = commitInfo?.authorEmail || null;
        const createdAt = commitInfo?.createdAt ? formatDate(commitInfo.createdAt) : null;

        return (
          <div>
            <Text code style={{ fontSize: "12px" }}>
              {shortSha}
            </Text>
            {text && (
              <Tooltip title={t("common.copy")}>
                <CopyOutlined
                  style={{ marginLeft: 6, color: "#999", cursor: "pointer" }}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(text);
                      message.success(t("common.copied"));
                    } catch {
                      message.error(t("common.copy_failed"));
                    }
                  }}
                />
              </Tooltip>
            )}
            {commitMessage && commitInfo && (
              <div style={{ fontSize: "12px", marginTop: "4px", color: "#666" }}>
                <Tooltip title={commitInfo.commitMessage}>
                  {commitMessage}
                  {commitInfo.commitMessage.length > 60 ? "..." : ""}
                </Tooltip>
              </div>
            )}
            {author && (
              <div style={{ fontSize: "11px", marginTop: "2px", color: "#999" }}>
                <Space size={4}>
                  {commitInfo?.avatar ? (
                    <Avatar src={commitInfo.avatar} size={18} />
                  ) : (
                    <Avatar size={18} icon={<UserOutlined />} />
                  )}
                  <span>
                    {author}
                    {email && author !== email && ` (${email})`}
                    {createdAt && ` · ${createdAt}`}
                  </span>
                </Space>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: t("projects.comparison.columns.fileCount"),
      key: "fileCount",
      width: 50,
      render: (_: unknown, record: CompareRecord) => (
        <Text strong>{record.files?.length || 0}</Text>
      ),
    },
    {
      title: t("projects.comparison.columns.action"),
      key: "action",
      width: 200,
      render: (_: unknown, record: CompareRecord) => {
        const buildTargets = record.buildTargets || [];
        const menuItems: MenuProps["items"] = [];

        if (buildTargets.length === 0) {
          menuItems.push({
            key: "__default__",
            label: (
              <a
                href={`/report/-/${params.provider}/${params.org}/${params.repo}/compare/${record.subjectID}/-`}
                target="_blank"
                rel="noreferrer"
              >
                {t("projects.comparison.default.buildTarget")}
              </a>
            ),
          });
        } else {
          buildTargets.forEach((buildTarget) => {
            menuItems.push({
              key: buildTarget || "__empty__",
              label: (
                <a
                  href={`/report/-/${params.provider}/${params.org}/${params.repo}/compare/${record.subjectID}/-?build_target=${encodeURIComponent(buildTarget)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {buildTarget || t("projects.comparison.empty.buildTarget")}
                </a>
              ),
            });
          });
        }

        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 6,
              width: "100%",
            }}
          >
            <Space size={12}>
              {record.compareUrl ? (
                <a href={record.compareUrl} target="_blank" rel="noreferrer">
                  <GitlabFilled style={{ marginRight: 4 }} />
                  源码对比
                </a>
              ) : null}
              <Dropdown menu={{ items: menuItems }} placement="bottomLeft">
                <a onClick={(e) => e.preventDefault()}>
                  {t("projects.comparison.view.report")} <DownOutlined />
                </a>
              </Dropdown>
              <Popconfirm
                title={t("projects.comparison.delete.confirm")}
                onConfirm={() => handleDelete(record)}
                okText={t("projects.comparison.modal.confirm")}
                cancelText={t("projects.comparison.modal.cancel")}
              >
                <Button type="link" danger icon={<DeleteOutlined />} size="small">
                  {t("common.delete")}
                </Button>
              </Popconfirm>
            </Space>
            <div
              style={{
                width: "100%",
                borderTop: "1px solid #f0f0f0",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Space size={12}>
                <a onClick={() => openSnapshotCreate(record)}>
                  <Space size={4}>
                    <CameraOutlined />
                    {t("projects.snapshot.button.create")}
                  </Space>
                </a>
                <a onClick={openSnapshotRecords}>
                  <Space size={4}>
                    <UnorderedListOutlined />
                    {t("projects.snapshot.button.records")}
                  </Space>
                </a>
              </Space>
            </div>
          </div>
        );
      },
    },
  ];

  const openSnapshotCreate = (record: CompareRecord) => {
    setSnapshotInitialValues({
      repoID: repo?.id ?? "",
      provider: params.provider ?? "",
      subject: "compare",
      subjectID: record.subjectID,
      buildTarget: record.buildTargets?.[0] ?? "",
      title: `${record.base.substring(0, 7)}...${record.head.substring(0, 7)}`,
      description: "",
    });
    setSnapshotDrawerMode("create");
    setSnapshotDrawerOpen(true);
  };

  const openSnapshotRecords = () => {
    setSnapshotInitialValues({
      repoID: repo?.id ?? "",
      provider: params.provider ?? "",
      subject: "compare",
    });
    setSnapshotDrawerMode("records");
    setSnapshotDrawerOpen(true);
  };

  if (!repo) {
    return <div>{t("projects.commits.loading")}</div>;
  }

  return (
    <div className={""}>
      <div className={"mb-4 flex items-center justify-between"}>
        <div>
          <h2 style={{ margin: 0 }}>{t("projects.comparison.title")}</h2>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {t("projects.comparison.desc")}
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          {t("projects.comparison.add")}
        </Button>
      </div>

      <CardPrimary>
        <SnapshotDrawer
          open={snapshotDrawerOpen}
          onClose={() => setSnapshotDrawerOpen(false)}
          mode={snapshotDrawerMode}
          initialValues={snapshotInitialValues}
          titleContext={
            params.org && params.repo ? { org: params.org, repo: params.repo } : undefined
          }
          onCreateSuccess={() => setSnapshotDrawerMode("records")}
          onSwitchToCreate={() => {
            setSnapshotDrawerMode("create");
            setSnapshotInitialValues({
              repoID: repo?.id ?? "",
              provider: params.provider ?? "",
              subject: "compare",
              subjectID: "",
              buildTarget: "",
              title: "",
              description: "",
            });
          }}
        />
        <Table<CompareRecord>
          columns={columns}
          dataSource={compareRecords}
          loading={loading}
          rowKey="id"
          pagination={{
            total: total,
            showTotal: (total) => t("projects.comparison.pagination.total", { total }),
            pageSize: 10,
          }}
        />
      </CardPrimary>

      <Modal
        title={t("projects.comparison.modal.title")}
        open={isModalOpen}
        onCancel={() => {
          if (!addLoading) {
            setIsModalOpen(false);
            form.resetFields();
          }
        }}
        onOk={() => {
          form.submit();
        }}
        okText={t("projects.comparison.modal.create")}
        cancelText={t("projects.comparison.modal.cancel")}
        confirmLoading={addLoading}
        cancelButtonProps={{ disabled: addLoading }}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            name="base"
            label={t("projects.comparison.form.base.label")}
            rules={[
              {
                required: true,
                message: t("projects.comparison.form.base.required"),
              },
              {
                pattern: /^[a-f0-9]{40}$/i,
                message: t("projects.comparison.form.base.invalid"),
              },
            ]}
          >
            <Input
              placeholder={t("projects.comparison.form.base.placeholder")}
              disabled={addLoading}
            />
          </Form.Item>
          <Form.Item
            name="head"
            label={t("projects.comparison.form.head.label")}
            rules={[
              {
                required: true,
                message: t("projects.comparison.form.head.required"),
              },
              {
                pattern: /^[a-f0-9]{40}$/i,
                message: t("projects.comparison.form.head.invalid"),
              },
            ]}
          >
            <Input
              placeholder={t("projects.comparison.form.head.placeholder")}
              disabled={addLoading}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComparePage;
