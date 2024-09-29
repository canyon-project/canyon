import React from "react";
import { BarsOutlined, SearchOutlined } from "@ant-design/icons";
import { Divider, Space, Segmented, Input } from "antd";

const TopControl = ({ total, showMode, onChangeShowMode }) => {
  const t = (msg) => msg;
  return (
    <div>
      <div className={"flex mb-2 justify-between items-center"}>
        <div className={"flex gap-2 flex-col"}>
          <Space>
            <Segmented
              value={showMode}
              defaultValue={showMode}
              onChange={(v) => {
                onChangeShowMode(v);
              }}
              options={[
                {
                  label: "Code tree",
                  value: "tree",
                  // icon: <Icon component={PhTreeView}/>,
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
          <Input
            value={""}
            addonBefore={<SearchOutlined />}
            className={"w-[240px]"}
            size={"small"}
          />
        </div>
      </div>
      <Divider style={{ margin: "0", marginBottom: "10px" }} />
    </div>
  );
};

export default TopControl;
