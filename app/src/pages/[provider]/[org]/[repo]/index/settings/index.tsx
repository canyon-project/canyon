import Icon, { TeamOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import {
  createRepoMember,
  deleteRepoMember,
  getRepoMembers,
  searchRepoMemberCandidates,
  updateRepo,
  updateRepoMember,
  type MemberCandidateUser,
  type RepoMember,
  type RepoMemberRole,
} from "@/services/repo";
import { SolarUserIdLinear } from "@/pages/[provider]/[org]/[repo]/index/settings/helpers/icons/SolarUserIdLinear.tsx";

const { Title } = Typography;

type Repo = {
  id: string;
  pathWithNamespace: string;
  description: string;
};

type MemberFormValues = {
  userID: string;
  role: RepoMemberRole;
};

const RepoSettings = () => {
  const { repo } = useOutletContext<{ repo: Repo | null }>();
  const params = useParams();
  const [form] = Form.useForm();
  const [memberForm] = Form.useForm<MemberFormValues>();
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [members, setMembers] = useState<RepoMember[]>([]);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<RepoMember | null>(null);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateOptions, setCandidateOptions] = useState<Array<{ label: string; value: string }>>(
    [],
  );
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const repoPath = repo?.pathWithNamespace || `${params.org}/${params.repo}`;
  const repoID = repo?.id;
  const provider = params.provider;

  const fetchMembers = async () => {
    if (!repoID || !provider) return;
    setMembersLoading(true);
    try {
      const data = await getRepoMembers(repoID, provider);
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      message.error("获取成员列表失败");
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    void fetchMembers();
  }, [repoID]);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = null;
      }
    };
  }, []);

  const onSaveRepo = async () => {
    if (!repoID || !provider) {
      message.error("仓库 ID 或 provider 不存在");
      return;
    }
    setLoading(true);
    try {
      const values = form.getFieldsValue() as { description?: string };
      await updateRepo(repoID, provider, { description: values.description });
      message.success("保存成功");
    } catch (error) {
      message.error("保存失败");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateMemberModal = () => {
    setEditingMember(null);
    memberForm.setFieldsValue({ userID: "", role: "developer" });
    setMemberModalOpen(true);
    void loadMemberCandidates("");
  };

  const openEditMemberModal = (member: RepoMember) => {
    setEditingMember(member);
    memberForm.setFieldsValue({ userID: member.userID, role: member.role });
    setCandidateOptions([
      {
        label: member.userName
          ? `${member.userName}${member.userEmail ? ` <${member.userEmail}>` : ""}`
          : member.userEmail || "未知用户",
        value: member.userID,
      },
    ]);
    setMemberModalOpen(true);
  };

  const toCandidateOption = (user: MemberCandidateUser) => ({
    value: user.id,
    label: `${user.name} <${user.email}>`,
  });

  const loadMemberCandidates = async (keyword: string) => {
    if (!repoID || !provider) return;
    setCandidateLoading(true);
    try {
      const users = await searchRepoMemberCandidates(repoID, provider, { keyword, limit: 20 });
      setCandidateOptions(users.map(toCandidateOption));
    } catch {
      message.error("搜索用户失败");
    } finally {
      setCandidateLoading(false);
    }
  };

  const handleSearchMember = (keyword: string) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      void loadMemberCandidates(keyword);
    }, 250);
  };

  const handleMemberSubmit = async () => {
    if (!repoID || !provider) {
      message.error("仓库 ID 或 provider 不存在");
      return;
    }
    try {
      const values = await memberForm.validateFields();
      setMemberSubmitting(true);
      if (editingMember) {
        await updateRepoMember(repoID, provider, editingMember.id, values);
        message.success("成员更新成功");
      } else {
        await createRepoMember(repoID, provider, values);
        message.success("成员添加成功");
      }
      setMemberModalOpen(false);
      setEditingMember(null);
      memberForm.resetFields();
      await fetchMembers();
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        message.error("成员已存在");
      } else if (status !== undefined) {
        message.error(editingMember ? "成员更新失败" : "成员添加失败");
      }
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleDeleteMember = async (member: RepoMember) => {
    if (!repoID || !provider) {
      message.error("仓库 ID 或 provider 不存在");
      return;
    }
    try {
      await deleteRepoMember(repoID, provider, member.id);
      message.success("成员删除成功");
      await fetchMembers();
    } catch {
      message.error("成员删除失败");
    }
  };

  const memberColumns: ColumnsType<RepoMember> = [
    {
      title: "成员",
      key: "member",
      render: (_, record) => (
        <div>
          <div>{record.userName || "-"}</div>
          <div style={{ color: "rgba(0, 0, 0, 0.45)", fontSize: 12 }}>{record.userEmail || "-"}</div>
        </div>
      ),
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role: RepoMemberRole) =>
        role === "admin" ? <Tag color="red">admin</Tag> : <Tag color="blue">developer</Tag>,
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: "操作",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEditMemberModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title={"确认删除该成员？"}
            okText={"删除"}
            cancelText={"取消"}
            onConfirm={() => handleDeleteMember(record)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!repo) return <div>加载中...</div>;

  return (
    <div>
      <Title level={4} className="mb-4 pt-4">
        项目设置
      </Title>

      <Card
className="mb-4"
        title={
          <span className={"flex items-center gap-1"}>
            <Icon style={{ fontSize: "18px" }} component={SolarUserIdLinear} />
            基础信息
          </span>
        }
      >
        <Form
          form={form}
          layout={"vertical"}
          initialValues={{ repoPath, repoID, description: repo?.description || "" }}
        >
          <Form.Item label={"仓库"} name={"repoPath"}>
            <Input disabled />
          </Form.Item>
          <Form.Item label={"项目 ID"} name={"repoID"}>
            <Input disabled />
          </Form.Item>
          <Form.Item label={"描述"} name={"description"}>
            <Input.TextArea rows={4} placeholder={"请输入项目描述"} />
          </Form.Item>
          <Form.Item>
            <Button type={"primary"} onClick={onSaveRepo} loading={loading}>
              保存更改
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={
          <div className="flex items-center justify-between">
            <span className={"flex items-center gap-1"}>
              <TeamOutlined />
              成员管理
            </span>
            <Button type="primary" onClick={openCreateMemberModal}>
              新增成员
            </Button>
          </div>
        }
      >
        <Table<RepoMember>
          rowKey="id"
          loading={membersLoading}
          dataSource={members}
          columns={memberColumns}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingMember ? "编辑成员" : "新增成员"}
        open={memberModalOpen}
        onOk={handleMemberSubmit}
        confirmLoading={memberSubmitting}
        okText={editingMember ? "保存" : "创建"}
        cancelText={"取消"}
        onCancel={() => {
          if (memberSubmitting) return;
          if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
            searchTimerRef.current = null;
          }
          setMemberModalOpen(false);
          setEditingMember(null);
          memberForm.resetFields();
        }}
      >
        <Form form={memberForm} layout="vertical">
          <Form.Item
            label={"成员"}
            name="userID"
            rules={[{ required: true, message: "请选择成员" }]}
          >
            <Select
              showSearch
              filterOption={false}
              placeholder={"输入姓名或邮箱搜索成员"}
              onSearch={handleSearchMember}
              onFocus={() => {
                if (candidateOptions.length === 0) {
                  void loadMemberCandidates("");
                }
              }}
              options={candidateOptions}
              loading={candidateLoading}
              notFoundContent={candidateLoading ? "搜索中..." : "无匹配用户"}
            />
          </Form.Item>
          <Form.Item label={"角色"} name="role" rules={[{ required: true, message: "请选择角色" }]}>
            <Select
              options={[
                { label: "admin", value: "admin" },
                { label: "developer", value: "developer" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RepoSettings;
