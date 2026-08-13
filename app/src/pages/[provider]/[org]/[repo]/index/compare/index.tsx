import {
  CameraOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
  GitlabFilled,
  PlusOutlined,
  SyncOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Radio,
  Segmented,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOutletContext, useParams } from "react-router-dom";
import CardPrimary from "@/components/card/Primary";
import SnapshotDrawer from "@/components/snapshot/SnapshotDrawer";
import type { SnapshotFormValues } from "@/services/snapshot";
import { createDiff, deleteDiff, getDiffList } from "@/services/code";
import type { DiffCreateBody } from "@/services/code";

const { Text } = Typography;

type Repo = {
  id: string;
  pathWithNamespace: string;
  description: string;
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
  title: string;
  authorName: string | null;
  authorEmail: string | null;
  avatar?: string | null;
  createdAt?: string;
};

type CompareMode = "commits" | "refs" | "mr";
type CompareRefKind = "sha" | "branch";
type CompareFormMode = "refs" | "mr";

type CompareRecord = {
  id: string;
  provider: string;
  repoID: string;
  base: string;
  head: string;
  subject: string;
  subjectID: string;
  createdAt?: string;
  files: DiffFile[];
  buildTargets: string[];
  compareUrl?: string | null;
  baseCommit: CommitInfo | null;
  headCommit: CommitInfo | null;
  mode?: CompareMode;
  live?: boolean;
  baseKind?: CompareRefKind;
  headKind?: CompareRefKind;
  baseRef?: string;
  headRef?: string;
  mrIid?: string | null;
};

type CompareFormValues = {
  mode: CompareFormMode;
  baseKind: CompareRefKind;
  headKind: CompareRefKind;
  baseRef: string;
  headRef: string;
  mrIid: string;
};

const ComparePage = () => {
  const { t } = useTranslation();
  const { repo } = useOutletContext<{
    repo: Repo | null;
  }>();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [refreshingID, setRefreshingID] = useState<string | null>(null);
  const [compareRecords, setCompareRecords] = useState<CompareRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<CompareFormValues>();
  const formMode = Form.useWatch("mode", form) ?? "refs";
  const watchedBaseKind = Form.useWatch("baseKind", form);
  const watchedHeadKind = Form.useWatch("headKind", form);
  const [snapshotDrawerOpen, setSnapshotDrawerOpen] = useState(false);
  const [snapshotDrawerMode, setSnapshotDrawerMode] = useState<"create" | "records">("create");
  const [snapshotInitialValues, setSnapshotInitialValues] = useState<Partial<SnapshotFormValues>>(
    {},
  );

  const fetchCompareRecords = async (targetPage = page, targetPageSize = pageSize) => {
    if (!repo?.id || !params.provider) {
      return;
    }

    setLoading(true);
    try {
      const data = await getDiffList({
        repoID: repo.id,
        provider: params.provider,
        page: targetPage,
        pageSize: targetPageSize,
      });
      setCompareRecords(Array.isArray(data.data) ? (data.data as CompareRecord[]) : []);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } catch (error) {
      message.error(t("projects.comparison.fetch.failed"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompareRecords();
  }, [repo?.id, params.provider, page, pageSize]);

  const handleAdd = async (values: CompareFormValues) => {
    if (!repo?.id || !params.provider) {
      return;
    }

    const body: DiffCreateBody = {
      repoID: repo.id,
      provider: params.provider,
      subject: "compare",
    };

    if (values.mode === "mr") {
      body.mode = "mr";
      body.mrIid = values.mrIid?.trim();
    } else {
      body.baseKind = values.baseKind;
      body.headKind = values.headKind;
      body.baseRef = values.baseRef?.trim();
      body.headRef = values.headRef?.trim();
    }

    setAddLoading(true);
    try {
      await createDiff(body);
      message.success(t("projects.comparison.create.success"));
      setIsModalOpen(false);
      form.resetFields();
      if (page === 1) {
        fetchCompareRecords(1, pageSize);
      } else {
        setPage(1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAddLoading(false);
    }
  };

  const handleRefresh = async (record: CompareRecord) => {
    if (!repo?.id || !params.provider) {
      return;
    }
    setRefreshingID(record.id);
    try {
      await createDiff({
        repoID: repo.id,
        provider: params.provider,
        subject: "compare",
        subjectID: record.subjectID,
        refresh: true,
      });
      message.success(t("projects.comparison.refresh.success"));
      fetchCompareRecords();
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshingID(null);
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
      if (compareRecords.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchCompareRecords();
      }
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

  const formatRefLabel = (kind: CompareRefKind | undefined, ref: string | undefined, sha: string) => {
    if (kind === "branch" && ref) return ref;
    const value = ref || sha;
    return value && /^[a-f0-9]{40}$/i.test(value) ? value.substring(0, 7) : value || "-";
  };

  const compareTitle = (record: CompareRecord) => {
    if (record.mrIid) return `MR !${record.mrIid}`;
    const base = formatRefLabel(record.baseKind, record.baseRef, record.base);
    const head = formatRefLabel(record.headKind, record.headRef, record.head);
    return `${base}...${head}`;
  };

  const renderRefCell = (
    sha: string,
    record: CompareRecord,
    side: "base" | "head",
  ) => {
    const kind = side === "base" ? record.baseKind : record.headKind;
    const ref = side === "base" ? record.baseRef : record.headRef;
    const commitInfo = side === "base" ? record.baseCommit : record.headCommit;
    const shortSha = sha ? sha.substring(0, 7) : "-";
    const titlePreview = commitInfo?.title
      ? commitInfo.title.split("\n")[0].substring(0, 60)
      : null;
    const author = commitInfo?.authorName || commitInfo?.authorEmail || null;
    const email = commitInfo?.authorEmail || null;
    const createdAt = commitInfo?.createdAt ? formatDate(commitInfo.createdAt) : null;
    const showBranch =
      kind === "branch" && typeof ref === "string" && ref.length > 0 && !/^[a-f0-9]{40}$/i.test(ref);

    return (
      <div>
        {showBranch ? (
          <div style={{ marginBottom: 4 }}>
            <Tag color="blue" style={{ marginInlineEnd: 0 }}>
              {ref}
            </Tag>
          </div>
        ) : null}
        <Text code style={{ fontSize: "12px" }}>
          {shortSha}
        </Text>
        {sha && (
          <Tooltip title={t("common.copy")}>
            <CopyOutlined
              style={{ marginLeft: 6, color: "#999", cursor: "pointer" }}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(sha);
                  message.success(t("common.copied"));
                } catch {
                  message.error(t("common.copy_failed"));
                }
              }}
            />
          </Tooltip>
        )}
        {titlePreview && commitInfo && (
          <div style={{ fontSize: "12px", marginTop: "4px", color: "#666" }}>
            <Tooltip title={commitInfo.title}>
              {titlePreview}
              {commitInfo.title.length > 60 ? "..." : ""}
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
  };

  const columns: ColumnsType<CompareRecord> = [
    {
      title: t("projects.comparison.columns.type"),
      key: "type",
      width: 110,
      render: (_: unknown, record: CompareRecord) => {
        if (record.mode === "mr" || record.mrIid) {
          return <Tag color="purple">MR !{record.mrIid}</Tag>;
        }
        if (record.live) {
          return <Tag color="blue">{t("projects.comparison.live.badge")}</Tag>;
        }
        return <Tag>{t("projects.comparison.type.commits")}</Tag>;
      },
    },
    {
      title: t("projects.comparison.columns.base"),
      dataIndex: "base",
      key: "base",
      width: 200,
      render: (text: string, record: CompareRecord) => renderRefCell(text, record, "base"),
    },
    {
      title: t("projects.comparison.columns.head"),
      dataIndex: "head",
      key: "head",
      width: 200,
      render: (text: string, record: CompareRecord) => renderRefCell(text, record, "head"),
    },
    {
      title: t("projects.comparison.columns.fileCount"),
      key: "fileCount",
      width: 60,
      render: (_: unknown, record: CompareRecord) => (
        <Text strong>{record.files?.length || 0}</Text>
      ),
    },
    {
      title: t("projects.comparison.columns.createdAt"),
      key: "createdAt",
      width: 100,
      sorter: (a, b) =>
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      defaultSortOrder: "descend",
      render: (_: unknown, record: CompareRecord) =>
        record.createdAt ? formatDate(record.createdAt) : "-",
    },
    {
      title: t("projects.comparison.columns.action"),
      key: "action",
      width: 400,
      render: (_: unknown, record: CompareRecord) => {
        return (
          <Space size={12} wrap={false}>
            {record.live ? (
              <Button
                type="link"
                size="small"
                icon={<SyncOutlined />}
                loading={refreshingID === record.id}
                onClick={() => handleRefresh(record)}
              >
                {t("projects.comparison.refresh")}
              </Button>
            ) : null}
            <Dropdown
              menu={{
                items: [
                  {
                    key: "create",
                    icon: <CameraOutlined />,
                    label: t("projects.snapshot.button.create"),
                  },
                  {
                    key: "records",
                    icon: <UnorderedListOutlined />,
                    label: t("projects.snapshot.button.records"),
                  },
                ],
                onClick: ({ key }) => {
                  if (key === "create") {
                    openSnapshotCreate(record);
                  } else if (key === "records") {
                    openSnapshotRecords();
                  }
                },
              }}
              placement="bottomLeft"
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  {t("projects.snapshot.menu")}
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
            {record.compareUrl ? (
              <a href={record.compareUrl} target="_blank" rel="noreferrer">
                <GitlabFilled style={{ marginRight: 4 }} />
                {t("projects.comparison.source.diff")}
              </a>
            ) : null}
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
      title: compareTitle(record),
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

  const openCreateModal = () => {
    form.setFieldsValue({
      mode: "refs",
      baseKind: "sha",
      headKind: "sha",
      baseRef: "",
      headRef: "",
      mrIid: "",
    });
    setIsModalOpen(true);
  };

  const shaRule = (field: "base" | "head") => ({
    pattern: /^[a-f0-9]{40}$/i,
    message: t(`projects.comparison.form.${field}.invalid`),
  });

  if (!repo) {
    return <div>{t("projects.commits.loading")}</div>;
  }

  const showRefInputs = formMode !== "mr";
  const baseKind = watchedBaseKind ?? "sha";
  const headKind = watchedHeadKind ?? "sha";
  const isLiveForm = showRefInputs && (baseKind === "branch" || headKind === "branch");

  return (
    <div className={""}>
      <div className={"mb-4 flex items-center justify-between"}>
        <div>
          <h2 style={{ margin: 0 }}>{t("projects.comparison.title")}</h2>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {t("projects.comparison.desc")}
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
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
        />
        <Table<CompareRecord>
          columns={columns}
          dataSource={compareRecords}
          loading={loading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (count) => t("projects.comparison.pagination.total", { total: count }),
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              if (newPageSize !== pageSize) {
                setPageSize(newPageSize);
                setPage(1);
              }
            },
          }}
        />
      </CardPrimary>

      <Modal
        title={t("projects.comparison.modal.title")}
        open={isModalOpen}
        width={640}
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          initialValues={{
            mode: "refs",
            baseKind: "sha",
            headKind: "sha",
          }}
        >
          <Form.Item name="mode" label={t("projects.comparison.form.mode.label")}>
            <Segmented
              block
              options={[
                { label: t("projects.comparison.form.mode.refs"), value: "refs" },
                { label: t("projects.comparison.form.mode.mr"), value: "mr" },
              ]}
            />
          </Form.Item>

          {formMode === "mr" || isLiveForm ? (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message={t("projects.comparison.live.hint")}
            />
          ) : null}

          {formMode === "mr" ? (
            <Form.Item
              name="mrIid"
              label={t("projects.comparison.form.mr.label")}
              extra={t("projects.comparison.form.mr.help")}
              rules={[
                { required: true, message: t("projects.comparison.form.mr.required") },
                { pattern: /^\d+$/, message: t("projects.comparison.form.mr.invalid") },
              ]}
            >
              <Input
                placeholder={t("projects.comparison.form.mr.placeholder")}
                disabled={addLoading}
              />
            </Form.Item>
          ) : null}

          {showRefInputs ? (
            <>
              <Form.Item label={t("projects.comparison.form.base.ref.label")} required>
                <Form.Item name="baseKind" style={{ marginBottom: 8 }}>
                  <Radio.Group
                    optionType="button"
                    options={[
                      { label: t("projects.comparison.form.kind.sha"), value: "sha" },
                      { label: t("projects.comparison.form.kind.branch"), value: "branch" },
                    ]}
                    disabled={addLoading}
                    onChange={() => {
                      void form.validateFields(["baseRef"]);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="baseRef"
                  noStyle
                  rules={[
                    { required: true, message: t("projects.comparison.form.base.required") },
                    ({ getFieldValue }) => ({
                      validator: async (_, value) => {
                        const kind = getFieldValue("baseKind");
                        if (kind === "sha" && value && !/^[a-f0-9]{40}$/i.test(value)) {
                          return Promise.reject(new Error(shaRule("base").message));
                        }
                      },
                    }),
                  ]}
                >
                  <Input
                    placeholder={
                      baseKind === "branch"
                        ? t("projects.comparison.form.branch.placeholder")
                        : t("projects.comparison.form.base.placeholder")
                    }
                    disabled={addLoading}
                  />
                </Form.Item>
              </Form.Item>

              <Form.Item label={t("projects.comparison.form.head.ref.label")} required>
                <Form.Item name="headKind" style={{ marginBottom: 8 }}>
                  <Radio.Group
                    optionType="button"
                    options={[
                      { label: t("projects.comparison.form.kind.sha"), value: "sha" },
                      { label: t("projects.comparison.form.kind.branch"), value: "branch" },
                    ]}
                    disabled={addLoading}
                    onChange={() => {
                      void form.validateFields(["headRef"]);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="headRef"
                  noStyle
                  rules={[
                    { required: true, message: t("projects.comparison.form.head.required") },
                    ({ getFieldValue }) => ({
                      validator: async (_, value) => {
                        const kind = getFieldValue("headKind");
                        if (kind === "sha" && value && !/^[a-f0-9]{40}$/i.test(value)) {
                          return Promise.reject(new Error(shaRule("head").message));
                        }
                      },
                    }),
                  ]}
                >
                  <Input
                    placeholder={
                      headKind === "branch"
                        ? t("projects.comparison.form.branch.placeholder")
                        : t("projects.comparison.form.head.placeholder")
                    }
                    disabled={addLoading}
                  />
                </Form.Item>
              </Form.Item>
            </>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
};

export default ComparePage;
