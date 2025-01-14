import Icon, { BarsOutlined, SearchOutlined } from "@ant-design/icons";
import PrepareProdFn from "@/components/CanyonReport/PrepareProdFn.tsx";
import PhTreeView from "@/components/CanyonReport/PhTreeView.tsx";
import { Divider, SliderSingleProps } from "antd";
import { getCOlor } from "@/helpers/utils/common.ts";

const marks: SliderSingleProps["marks"] = {
  50: {
    style: {
      fontSize: "10px",
    },
    label: <>50</>,
  },
  80: {
    style: {
      fontSize: "10px",
    },
    label: <>80</>,
  },
};
function returnPositiveNumbers(num) {
  if (num < 0) {
    return 0;
  } else {
    return num;
  }
}
function genBackground(range) {
  const a = range[0];
  const b = range[1];
  return `linear-gradient(to right, ${getCOlor(0)} 0%, ${getCOlor(0)} ${(returnPositiveNumbers(50 - a) * 100) / (b - a)}%, ${getCOlor(60)} ${(returnPositiveNumbers(50 - a) * 100) / (b - a)}%, ${getCOlor(60)} ${(returnPositiveNumbers(80 - a) * 100) / (b - a)}%, ${getCOlor(90)} ${((80 - a) * 100) / (b - a)}%, ${getCOlor(90)} 100%)`;
}

const CanyonReportControl = ({
  numberFiles,
  onChangeOnlyChange,
  onChangeOnlyChangeKeywords,
  keywords,
  onlyChange,
  onChangeShowMode,
  onChangeRange,
  showMode,
  range,
}) => {
  const { t } = useTranslation();
  // TODO 暂时不能删除prm
  const prm = useParams();
  // const [range, setRange] = useState([0, 100]);
  return (
    <>
      <div className={"flex mb-2 justify-between items-center"}>
        <div className={"flex gap-2 flex-col"}>
          <div className={"flex gap-1 items-center"}>
            <Segmented
              size={"small"}
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

            <span style={{ fontSize: "12px" }}>
              {t("projects.detail.total.files", {
                msg: numberFiles,
              })}
              {/*覆盖率提升优先级列表*/}
              {/*转换生产流量为测试用例*/}
              <PrepareProdFn />
            </span>
          </div>
        </div>

        <div className={"flex items-center"}>
          <div className={"flex items-center gap-2 hidden"}>
            <Typography.Text type={"secondary"} style={{ fontSize: "12px" }}>
              未覆盖维度:
            </Typography.Text>
            <Segmented
              size="small"
              options={["所有维度", "语句", "函数", "分支"]}
            />
          </div>

          <Divider type={"vertical"} />
          <div className={"flex items-center gap-2"}>
            <Typography.Text type={"secondary"} style={{ fontSize: "12px" }}>
              {t("projects.detail.only.changed")}:{" "}
            </Typography.Text>
            <Switch
              checked={onlyChange}
              size={"small"}
              onChange={onChangeOnlyChange}
            />
          </div>
          <Divider type={"vertical"} />
          <div className={"flex items-center"}>
            <Typography.Text type={"secondary"} style={{ fontSize: "12px" }}>
              范围：
            </Typography.Text>
            <div
              style={{
                height: "30px",
                transform: "translateY(-2px)",
              }}
            >
              <Slider
                className={"w-[160px]"}
                range
                marks={marks}
                defaultValue={range}
                onChange={(va) => {
                  onChangeRange(va);
                }}
                styles={{
                  track: {
                    background: "transparent",
                  },
                  tracks: {
                    background: genBackground(range),
                  },
                }}
              />
            </div>
          </div>
          <Divider type={"vertical"} />
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
