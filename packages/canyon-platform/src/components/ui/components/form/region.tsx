import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Space } from "antd";
import type { FC, ReactNode } from "react";

const RegionForm: FC<{
  title: string;
  icon: ReactNode;
  onSave?: () => void;
  onAdd?: () => void;
  children: ReactNode;
}> = ({ title, icon, onSave, onAdd, children }) => {
  return (
    <Card
      className={"shadow rounded-lg overflow-hidden"}
      title={
        <div className={"flex items-center"}>
          <div className={"text-[#687076] mr-2 text-[16px]"}>{icon}</div>
          <span>{title}</span>
        </div>
      }
    >
      <Card.Grid hoverable={false} style={{ width: "100%" }}>
        <div className={"mb-5"}>{children}</div>
        <Space>
          <Button type={"primary"} onClick={onSave}>
            保存更改
          </Button>
          {onAdd && (
            <Button icon={<PlusOutlined />} onClick={onAdd}>
              添加
            </Button>
          )}
        </Space>
      </Card.Grid>
    </Card>
  );
};

export default RegionForm;
