import { Button, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

type UserRecord = {
  key: string;
  name: string;
  department: string;
  role: string;
  status: "active" | "inactive";
};

const data: UserRecord[] = [
  { key: "1", name: "张三", department: "研发部", role: "工程师", status: "active" },
  { key: "2", name: "李四", department: "产品部", role: "产品经理", status: "active" },
  { key: "3", name: "王五", department: "运营部", role: "运营专员", status: "inactive" },
];

const columns: ColumnsType<UserRecord> = [
  { title: "姓名", dataIndex: "name", key: "name" },
  { title: "部门", dataIndex: "department", key: "department" },
  { title: "角色", dataIndex: "role", key: "role" },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    render: (status: UserRecord["status"]) =>
      status === "active" ? <Tag color="success">在职</Tag> : <Tag color="default">停用</Tag>,
  },
  {
    title: "操作",
    key: "action",
    render: () => (
      <Space>
        <Button type="link" size="small">
          编辑
        </Button>
        <Button type="link" size="small" danger>
          删除
        </Button>
      </Space>
    ),
  },
];

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Title level={3} className="!mb-1">
            用户管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="!mb-0">
            示例列表页，可在此接入真实接口与表单。
          </Typography.Paragraph>
        </div>
        <Button type="primary">新建用户</Button>
      </div>
      <Table columns={columns} dataSource={data} pagination={false} />
    </div>
  );
}
