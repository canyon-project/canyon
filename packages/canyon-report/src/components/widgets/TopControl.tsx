import { FC } from "react";
import Icon, { BarsOutlined, SearchOutlined } from "@ant-design/icons";
import { Divider, Space, Segmented, Input, Typography, Switch } from "antd";
import PhTreeViewIcon from "../icons/PhTreeView";
import { css } from "@emotion/react";

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
      <div
        css={css`
          display: flex;
          margin-bottom: 10px;
          justify-content: space-between;
          align-items: center;
        `}
      >
        <div
          css={css`
            display: flex;
            gap: 10px;
            flex-direction: column;
          `}
        >
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
              <span
                css={css`
                  margin-bottom: 10px;
                `}
              >
                {total} total files
              </span>
            </span>
          </Space>
        </div>

        <div
          css={css`
            display: flex;
            align-items: center;
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: 10px;
            `}
          >
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
            css={css`
              width: 240px;
            `}
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
