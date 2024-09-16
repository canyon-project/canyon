import Icon, { BarsOutlined, SearchOutlined } from "@ant-design/icons";
import PrepareProdFn from "@/components/CanyonReport/PrepareProdFn.tsx";
import PhTreeView from "@/components/CanyonReport/PhTreeView.tsx";

const { useToken } = theme;

const CanyonReportControl = ({
  numberFiles,
  onChangeOnlyChange,
  onChangeOnlyChangeKeywords,
  keywords,
  onlyChange,
  onChangeShowMode,
  showMode,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div className={"flex mb-2 justify-between"}>
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
                  label: t("projects.detail.code.tree"),
                  value: "tree",
                  icon: <Icon component={PhTreeView} />,
                },
                {
                  label: t("projects.detail.file.list"),
                  value: "list",
                  icon: <BarsOutlined />,
                },
              ]}
            />

            <span style={{ fontSize: "14px" }}>
              {/*<span className={'mr-2'}>{numberFiles}</span>*/}
              {t("projects.detail.total.files", { msg: numberFiles })}
              {/*覆盖率提升优先级列表*/}
              {/*转换生产流量为测试用例*/}
              <PrepareProdFn />
            </span>
          </Space>
        </div>

        <div className={"flex items-center gap-2"}>
          <Typography.Text type={"secondary"} style={{ fontSize: "12px" }}>
            {t("projects.detail.only.changed")}:{" "}
          </Typography.Text>
          <Switch
            checked={onlyChange}
            size={"small"}
            onChange={onChangeOnlyChange}
            // checkedChildren={<HeartFilled />}
          />
          <Input
            value={keywords}
            addonBefore={<SearchOutlined />}
            placeholder={t("projects.detail.search.placeholder")}
            className={"w-[240px]"}
            size={"small"}
            onChange={onChangeOnlyChangeKeywords}
          />
        </div>
      </div>
    </>
  );
};

export default CanyonReportControl;
