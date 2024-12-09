// import { useRequest } from "ahooks";
import { FC } from "react";
import { Button, Form, Input } from "antd";
const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

type FieldType = {
  companyname?: string;
  username?: string;
  password?: string;
};

const LoginForm: FC<{
  onLoginSuccess: () => void;
}> = ({ onLoginSuccess }) => {
  const [form] = Form.useForm();
  const onFinish = (values: any) => {
    console.log("Success:", values);
    // run({
    //   companyname: String(values.companyname),
    //   username: String(values.username),
    //   password: String(values.password),
    // });
  };
  return (
    <Form
      form={form}
      name="basic"
      layout={"vertical"}
      className={"flex-1 pr-5"}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item<FieldType>
        label="Username"
        name="username"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <Input placeholder={"Username or Email"} />
      </Form.Item>

      <Form.Item<FieldType>
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password placeholder={"Password"} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Continue
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
