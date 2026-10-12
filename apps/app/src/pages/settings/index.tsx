import { Button, Form, Input, Switch, Typography } from "antd";

export default function SettingsPage() {
  const [form] = Form.useForm();

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <Typography.Title level={3} className="!mb-1">
          系统设置
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="!mb-0">
          基础配置示例，提交逻辑可按业务自行扩展。
        </Typography.Paragraph>
      </div>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ siteName: "企业管理后台", notify: true }}
        onFinish={(values) => {
          console.log("settings:", values);
        }}
      >
        <Form.Item
          label="站点名称"
          name="siteName"
          rules={[{ required: true, message: "请输入站点名称" }]}
        >
          <Input placeholder="请输入站点名称" />
        </Form.Item>
        <Form.Item label="联系邮箱" name="email">
          <Input placeholder="admin@example.com" />
        </Form.Item>
        <Form.Item label="开启通知" name="notify" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
