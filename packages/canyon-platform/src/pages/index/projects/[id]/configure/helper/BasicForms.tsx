import { useMutation } from "@apollo/client";
import { useForm } from "antd/es/form/Form";
import { FC } from "react";

import { UpdateProjectDocument } from "../../../../../../helpers/backend/gen/graphql.ts";

const { TextArea } = Input;

const BasicForms: FC<{ data: any }> = ({ data }, ref) => {
  const [updateProject] = useMutation(UpdateProjectDocument);
  const prm: any = useParams();
  const { t } = useTranslation();
  const onFinish = (values: any) => {
    updateProject({
      variables: {
        projectID: prm.id,
        coverage: "__null__",
        description: values.description,
        defaultBranch: "__null__",
        instrumentCwd: values.instrumentCwd,
      },
    }).then(() => {
      message.success("成功");
    });
  };
  const [form] = useForm();
  const onSubmit = () => {
    form.submit();
  };
  useImperativeHandle(ref, () => ({
    submit: onSubmit,
  }));
  // use
  if (data) {
    return (
      <Form
        form={form}
        className={"w-[850px]"}
        name="basic"
        layout={"vertical"}
        initialValues={{
          pathWithNamespace: data.pathWithNamespace,
          description: data.description,
          projectID: data.id,
          tag: data.tag,
          language: data.language,
          instrumentCwd: data.instrumentCwd,
        }}
        onFinish={onFinish}
      >
        <div className={"flex"}>
          <Form.Item<any>
            label={t("new.repository")}
            name="pathWithNamespace"
            className={"flex-1 mr-10"}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item<any>
            className={"flex-3"}
            label={t("projects.config.project.id")}
            name="projectID"
          >
            <Input disabled />
          </Form.Item>
        </div>

        <Form.Item<any> label={t("common.language")} name="language">
          <Input disabled />
        </Form.Item>

        <Form.Item<any>
          label={t("projects.config.project.desc")}
          name="description"
        >
          <TextArea autoSize={{ minRows: 3, maxRows: 3 }} />
        </Form.Item>
        <Form.Item<any>
          label={"覆盖率插桩路径转换"}
          name="instrumentCwd"
          tooltip={"用于扭转发生错位的情况，通常不需要配置。"}
        >
          <Input placeholder={"/source/coverage/path=>/replace/path"} />
        </Form.Item>
      </Form>
    );
  } else {
    return <div>loading</div>;
  }
};

export default forwardRef(BasicForms);
