// @ts-nocheck
import React from "react";
import Icon, { BarsOutlined, SearchOutlined } from "@ant-design/icons";
import { Divider, Space, Segmented, Input } from "antd";

const TopControl = () => {
  const t = (msg) => msg;
  return (
    <div>
      <div className={"flex mb-2 justify-between items-center"}>
        <div className={"flex gap-2 flex-col"}>
          <Space>
            <Segmented
              // value={showMode}
              // defaultValue={showMode}
              // onChange={(v) => {
              //   onChangeShowMode(v);
              // }}
              options={[
                {
                  label: t("projects.detail.code.tree"),
                  value: "tree",
                  // icon: <Icon component={PhTreeView}/>,
                },
                {
                  label: t("projects.detail.file.list"),
                  value: "list",
                  icon: <BarsOutlined />,
                },
              ]}
            />

            <span style={{ fontSize: "14px" }}>
              899
              {/*<span className={'mr-2'}>{numberFiles}</span>*/}
              {/*{t("projects.detail.total.files", {msg: numberFiles})}*/}
              {/*覆盖率提升优先级列表*/}
              {/*转换生产流量为测试用例*/}
              {/*<PrepareProdFn/>*/}
            </span>
          </Space>
        </div>

        <div className={"flex items-center"}>
          <Input
            value={"keywords"}
            addonBefore={<SearchOutlined />}
            // placeholder={t("projects.detail.search.placeholder")}
            className={"w-[240px]"}
            size={"small"}
            // onChange={onChangeOnlyChangeKeywords}
          />
        </div>
      </div>
    </div>
  );
};

export default TopControl;
