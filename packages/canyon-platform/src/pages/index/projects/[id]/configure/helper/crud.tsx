import { PlusOutlined } from "@ant-design/icons";
import { FC, useState } from "react";

/**
 * noop is a helper function that does nothing
 * @returns undefined
 */
function noop() {
  /** no-op */
}

// 注意多默认值
// noob函数

interface CrudTableProps {
  dataSource: any[];
  loading: boolean;
  columns: any[];
  formItems: any;
  onCreate?: (values: any) => void;
  onDelete?: (values: any) => void;
  onUpdate?: (values: any) => void;
  onSave?: () => void;
}

const CrudTable: FC<CrudTableProps> = ({
  dataSource,
  loading,
  columns,
  formItems,
  /* === */
  onCreate = noop,
  onDelete = noop,
  onUpdate = noop,
  onSave = noop,
}) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  function onFinish(values) {
    if (values.mode === "create") {
      if (values.userID && values.role) {
        onCreate(values);
      }
    } else {
      onUpdate(values);
    }
    setVisible(false);
  }
  function closeDrawer() {
    setVisible(false);
    // onFinish({ mode: 'create' });
    form.submit();
    setTimeout(() => {
      form.resetFields();
    }, 100);
  }

  function add() {
    setVisible(true);
    form.setFieldsValue({
      mode: "create",
      emails: [],
    });
  }

  function edit(record) {
    setVisible(true);
    form.setFieldsValue({
      ...record,
      mode: "update",
    });
  }

  return (
    <div className={""}>
      <Table
        bordered={true}
        pagination={false}
        size={"small"}
        rowKey={"id"}
        dataSource={dataSource}
        columns={columns.concat({
          title: "操作",
          render: (text, record) => {
            return (
              <div>
                <a
                  onClick={() => {
                    edit(record);
                  }}
                >
                  编辑
                </a>

                <Divider type={"vertical"} />

                <a className={"text-red-500"} onClick={() => onDelete(record)}>
                  {"删除"}
                </a>
              </div>
            );
          },
        })}
        loading={loading}
      />
      <div className={"h-2"}></div>

      <Space>
        <Button type={"primary"} onClick={onSave}>
          保存更改
        </Button>
        <Button onClick={add}>
          <PlusOutlined />
          添加
        </Button>
      </Space>
      <Drawer
        title={form.getFieldValue("mode")}
        open={visible}
        width={"45%"}
        onClose={closeDrawer}
      >
        <Form form={form} onFinish={onFinish} layout={"vertical"}>
          <Form.Item label="mode" name={"mode"} style={{ display: "none" }}>
            <Input />
          </Form.Item>
          {formItems(form.getFieldValue("mode"))}
        </Form>
      </Drawer>
    </div>
  );
};

export default CrudTable;
