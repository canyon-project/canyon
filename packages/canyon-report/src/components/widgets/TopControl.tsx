import { FC } from "react";
import Icon, { BarsOutlined, SearchOutlined } from "@ant-design/icons";
import { Divider, Space, Segmented, Input, Typography, Switch } from "antd";
import PhTreeViewIcon from "../icons/PhTreeView";

const TopControl: FC<{
  total: number;
  showMode: string;
  filenameKeywords: string;
  onChangeShowMode: (mode: string) => void;
  onChangeKeywords: (word: string) => void;
  onChangeOnlyChange: (checked: boolean) => void;
  onlyChange: boolean;
}> = ({
  total,
  showMode,
  onChangeShowMode,
  onChangeKeywords,
  filenameKeywords,
  onChangeOnlyChange,
  onlyChange,
}) => {
  // const { t } = useTranslation();
  return (
    <div>
      <div className={"flex mb-2 justify-between items-center"}>
        <div className={"flex gap-2 flex-col"}>
          <Space>
            <Segmented
              size={"small"}
              value={showMode}
              defaultValue={showMode}
              onChange={(v) => {
                onChangeShowMode(v);
              }}
              options={[
                {
                  label: "Code tree",
                  value: "tree",
                  icon: <Icon component={PhTreeViewIcon} />,
                },
                {
                  label: "File list",
                  value: "list",
                  icon: <BarsOutlined />,
                },
              ]}
            />

            <span style={{ fontSize: "14px" }}>
              <span className={"mr-2"}>{total} total files</span>
            </span>
          </Space>
        </div>

        <div className={"flex items-center"}>
          <div className={"flex items-center gap-2"}>
            <Typography.Text type={"secondary"} style={{ fontSize: "12px" }}>
              {"Only Changed"}:{" "}
            </Typography.Text>
            <Switch
              checked={onlyChange}
              size={"small"}
              onChange={onChangeOnlyChange}
            />
          </div>
          <Divider type={"vertical"} />
          <Input
            placeholder={"Enter the file path to search"}
            value={filenameKeywords}
            addonBefore={<SearchOutlined />}
            className={"w-[240px]"}
            size={"small"}
            onChange={(val) => {
              onChangeKeywords(val.target.value);
            }}
          />
        </div>
      </div>
      <Divider style={{ margin: "0", marginBottom: "10px" }} />
    </div>
  );
};

export default TopControl;
