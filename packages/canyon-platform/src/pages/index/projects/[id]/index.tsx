import Icon, {
  AimOutlined,
  BranchesOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { Space, TourProps } from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import ReactECharts from "echarts-for-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import ProjectRecordDetailDrawer from "../../../../components/app/ProjectRecordDetailDrawer.tsx";
import MaterialSymbolsCommitSharp from "../../../../components/icons/MaterialSymbolsCommitSharp.tsx";
import {
  DeleteProjectRecordDocument,
  GetProjectByIdDocument,
  GetProjectChartDataDocument,
  GetProjectCompartmentDataDocument,
  GetProjectRecordsDocument,
  ProjectRecordsModel,
} from "@/helpers/backend/gen/graphql.ts";

const { useToken } = theme;
const { Title, Text } = Typography;
import npmSvg from '../../../../assets/npm.svg'

const ProjectOverviewPage = () => {
  const { token } = useToken();
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState("");
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [sha, setSha] = useState("");
  const initDefaultBranchOnly = Boolean(
    localStorage.getItem("defaultBranchOnly"),
  );
  const [defaultBranchOnly, setDefaultBranchOnly] = useState(
    initDefaultBranchOnly,
  );
  const onClose = () => {
    setOpen(false);
  };

  const pam = useParams();

  const { data: projectsData, loading } = useQuery(GetProjectRecordsDocument, {
    variables: {
      projectID: pam.id as string,
      current: current,
      pageSize: pageSize,
      keyword: keyword,
      onlyDefault: defaultBranchOnly,
    },
    fetchPolicy: "no-cache",
  });

  const { data: projectByIdData } = useQuery(GetProjectByIdDocument, {
    variables: {
      projectID: pam.id as string,
    },
    fetchPolicy: "no-cache",
  });

  const { data: projectChartData, loading: projectChartDataLoading } = useQuery(
    GetProjectChartDataDocument,
    {
      variables: {
        projectID: pam.id as string,
        branch: "-",
      },
      fetchPolicy: "no-cache",
    },
  );

  const {
    data: projectCompartmentDataData,
    loading: projectCompartmentDataLoading,
  } = useQuery(GetProjectCompartmentDataDocument, {
    variables: {
      projectID: pam.id as string,
      defaultCoverageDim:
        localStorage.getItem("defaultCoverageDim") || "statements",
    },
    fetchPolicy: "no-cache",
  });
  const [deleteProjectRecord] = useMutation(DeleteProjectRecordDocument);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const [tourOpen, setTourOpen] = useState(false);

  const defaultCoverageDim =
    localStorage.getItem("defaultCoverageDim") || "statements";

  const steps: TourProps["steps"] = [
    {
      title: t("projects.statements_tour_title"),
      description: t("projects.statements_tour_description"),
      target: () => ref1.current,
    },
    {
      title: t("projects.newlines_tour_title"),
      description: t("projects.newlines_tour_description"),
      target: () => ref2.current,
    },
  ];

  useEffect(() => {
    if (!localStorage.getItem("touropen")) {
      setTimeout(() => {
        setTourOpen(true);
        localStorage.setItem("touropen", "true");
      }, 2000);
    }
  }, []);

  const columns: ColumnsType<ProjectRecordsModel> = [
    {
      title: (
        <div>
          <Icon component={MaterialSymbolsCommitSharp} className={"mr-1"} />
          Sha
        </div>
      ),
      dataIndex: "sha",
      width: "120px",
      render(_, { webUrl,buildProvider }): JSX.Element {
        return (
          <Space>
            <a href={webUrl} target={"_blank"} rel="noreferrer">
              {_?.slice(0, 7)}
            </a>
            {buildProvider==='jenkins_npm'&&<img className={'w-[20px]'} src={npmSvg} alt="" />}
          </Space>
        );
      },
    },
    {
      title: (
        <>
          <BranchesOutlined className={"mr-1"} />
          {t("projects.branch")}
        </>
      ),
      dataIndex: "branch",
      ellipsis: true,
      width: "120px",
    },
    {
      title: (
        <>
          <AimOutlined className={"mr-1"} />
          {t("projects.compare_target")}
        </>
      ),
      dataIndex: "compareTarget",
      width: "120px",
      render(_, { compareUrl }): JSX.Element {
        return (
          <a href={compareUrl} target={"_blank"} rel="noreferrer">
            {_.length === 40 ? _.slice(0, 7) : _}
          </a>
        );
      },
    },
    // {
    //   title: <>{t("Build")}</>,
    //   align: "center",
    //   width: "70px",
    //   render(_, record) {
    //     if (!record.buildURL) {
    //       return <span>-</span>;
    //     }
    //     return (
    //       <a
    //         href={record.buildURL}
    //         target={"_blank"}
    //         rel="noreferrer"
    //         className={"flex item-center justify-center"}
    //       >
    //         <img
    //           className={"w-[16px]"}
    //           src={`/gitproviders/${record.buildProvider || "gitlab"}.svg`}
    //           alt=""
    //         />
    //       </a>
    //     );
    //   },
    // },
    {
      title: t("projects.message"),
      dataIndex: "message",
      width: "200px",
      ellipsis: true,
    },
    ...[defaultCoverageDim, "newlines"].map((item) => {
      return {
        title: t(`projects.${item}`),
        dataIndex: item,
        render(_, { sha }) {
          return (
            <Link
              to={{
                pathname: `/projects/${pam.id}/commits/${sha}/-`,
              }}
            >
              {_}%
            </Link>
          );
        },
      };
    }),
    {
      title: t("projects.report_times"),
      dataIndex: "times",
      width: "80px",
    },
    {
      title: t("projects.latest_report_time"),
      dataIndex: "lastReportTime",
      width: "135px",
      render(_) {
        return <span>{dayjs(_).format("MM-DD HH:mm")}</span>;
      },
    },
    {
      title: t("common.option"),
      width: "85px",
      render(_): JSX.Element {
        return (
          <div>
            <a
              onClick={() => {
                setOpen(true);
                setSha(_.sha);
              }}
            >
              {t("projects.reported_details")}
            </a>
            {/*<Divider type={"vertical"} />*/}

            {/*<Popconfirm*/}
            {/*  title="Delete the project record"*/}
            {/*  description="Are you sure to delete this project record?"*/}
            {/*  onConfirm={() => {*/}
            {/*    deleteProjectRecord({*/}
            {/*      variables: {*/}
            {/*        projectID: pam.id as string,*/}
            {/*        sha: _.sha,*/}
            {/*      },*/}
            {/*    })*/}
            {/*      .then(() => {*/}
            {/*        window.location.reload();*/}
            {/*      })*/}
            {/*      .catch((err) => {*/}
            {/*        console.log(err);*/}
            {/*      });*/}
            {/*  }}*/}
            {/*  onCancel={() => {*/}
            {/*    console.log("cancel");*/}
            {/*  }}*/}
            {/*  okText="Yes"*/}
            {/*  cancelText="No"*/}
            {/*>*/}
            {/*  <a className={"text-red-500 hover:text-red-600"}>*/}
            {/*    {t("common.delete")}*/}
            {/*  </a>*/}
            {/*</Popconfirm>*/}
          </div>
        );
      },
    },
  ];

  const option = {
    backgroundColor: "transparent",
    grid: {
      top: "30px",
      left: "30px",
      right: "10px",
      bottom: "20px",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      x: "right",
      data: [t(`projects.${defaultCoverageDim}`), t("projects.newlines")],
    },
    xAxis: {
      type: "category",
      data:
        projectChartData?.getProjectChartData.map(({ sha }) =>
          sha.slice(0, 7),
        ) || [],
    },
    yAxis: {
      type: "value",
    },
    series: [t(`projects.${defaultCoverageDim}`), t("projects.newlines")].map(
      (_, index) => ({
        name: _,
        data:
          projectChartData?.getProjectChartData
            .map((item) => {
              return [item[defaultCoverageDim], item.newlines];
            })
            .map(([first, newlines]) => (index === 0 ? first : newlines)) || [],
        type: "line",
      }),
    ),
  };
  const nav = useNavigate();
  return (
    <div className={""}>
      <div className={"mb-10"}>
        <div className={"flex"}>
          <Title level={2}>
            {projectByIdData?.getProjectByID.pathWithNamespace}
            <EditOutlined
              className={"ml-3 cursor-pointer text-[#0071c2]"}
              style={{ fontSize: "20px" }}
              onClick={() => {
                nav(`/projects/${pam.id}/settings`);
              }}
            />
          </Title>
        </div>

        <div>
          <Text type={"secondary"}>
            {t("projects.config.project.id")}:{" "}
            {projectByIdData?.getProjectByID.id}
          </Text>
          <Text className={"ml-6"} type={"secondary"}>
            {t("projects.default.branch")}:{" "}
            {projectByIdData?.getProjectByID.defaultBranch}
          </Text>
        </div>
        {(projectByIdData?.getProjectByID.tags || []).length > 0 && (
          <div className={"pt-5"}>
            <Text className={"mr-3"} type={"secondary"}>
              {t("projects.config.tag")}:
            </Text>
            {projectByIdData?.getProjectByID.tags.map(
              ({ color, name, link }, index) => (
                <Tag
                  style={{
                    cursor: link ? "pointer" : "default",
                  }}
                  key={index}
                  color={color}
                  onClick={() => {
                    if (link) {
                      window.open(link);
                    }
                  }}
                >
                  {name}
                </Tag>
              ),
            )}
          </div>
        )}
      </div>

      <Text className={"block mb-3"} style={{ fontWeight: 500, fontSize: 16 }}>
        {t("projects.overview")}
      </Text>
      <Tour
        open={tourOpen}
        onClose={() => {
          setTourOpen(false);
        }}
        steps={steps}
      />
      <div className={"flex mb-10"}>
        <Spin spinning={projectCompartmentDataLoading}>
          <div
            className={`[list-style:none] grid grid-cols-[repeat(2,_215px)] grid-rows-[repeat(2,_1fr)] gap-[16px] h-full mr-[16px]`}
          >
            {(projectCompartmentDataData?.getProjectCompartmentData || []).map(
              (item, index) => {
                return (
                  <div
                    className={
                      "p-[20px] h-[150px] flex justify-between flex-col bg-white dark:bg-[#0C0D0E]"
                    }
                    style={{
                      border: `1px solid ${token.colorBorder}`,
                      borderRadius: `${token.borderRadius}px`,
                    }}
                    key={index}
                  >
                    <Text type={"secondary"}>{t(item.label)}</Text>
                    <Text className={"!text-xl"}>{item.value}</Text>
                  </div>
                );
              },
            )}
          </div>
        </Spin>

        <div style={{ flex: 1 }}>
          <Spin spinning={projectChartDataLoading}>
            <div
              className={"p-[18px] bg-white dark:bg-[#0C0D0E]"}
              style={{
                border: `1px solid ${token.colorBorder}`,
                borderRadius: `${token.borderRadius}px`,
              }}
            >
              <div className={"flex items-center"}>
                <Title level={5} style={{ marginBottom: "0" }}>
                  {t("projects.trends_in_coverage")}
                </Title>
                <Text
                  type={"secondary"}
                  className={"ml-2"}
                  style={{ fontSize: 12 }}
                >
                  {t("projects.trends.tooltip")}
                </Text>
              </div>
              <ReactECharts
                theme={
                  localStorage.getItem("theme") === "dark"
                    ? "dark"
                    : {
                        color: ["#287DFA", "#FFB400"],
                      }
                }
                style={{ height: "254px" }}
                option={option}
              />
            </div>
          </Spin>
        </div>
      </div>

      <Text className={"block mb-3"} style={{ fontWeight: 500, fontSize: 16 }}>
        {t("projects.records")}
      </Text>
      <div
        className={"flex"}
        style={{
          marginBottom: "16px",
          justifyContent: "space-between",
        }}
      >
        <div className={"flex items-center gap-5"}>
          <Input.Search
            defaultValue={keyword}
            placeholder={t("projects.overview_search_keywords")}
            onSearch={(value) => {
              setKeyword(value);
              setCurrent(1);
            }}
            style={{ width: "600px" }}
          />
          <Space>
            <Text type={"secondary"}>
              {t("projects.only.default.branch")}:{" "}
            </Text>
            <Switch
              defaultChecked={Boolean(
                localStorage.getItem("defaultBranchOnly"),
              )}
              onChange={(v) => {
                if (v) {
                  localStorage.setItem("defaultBranchOnly", "1");
                } else {
                  localStorage.removeItem("defaultBranchOnly");
                }
                setDefaultBranchOnly(v);
              }}
            />
          </Space>
        </div>

        {/*<div className={"flex gap-2"}>*/}
        {/*  <Popover trigger={'click'} placement={'right'} content={*/}
        {/*    <div>*/}
        {/*      <Checkbox.Group options={plainOptions} defaultValue={projectCoverageRecordColumns} onChange={(val)=>{*/}
        {/*        setProjectCoverageRecordColumns(val);*/}
        {/*      }} />*/}
        {/*    </div>*/}
        {/*  } title="列展示">*/}
        {/*    <SettingOutlined/>*/}
        {/*  </Popover>*/}
        {/*</div>*/}
      </div>
      <Table
        loading={loading}
        style={{
          border: `1px solid ${token.colorBorder}`,
          borderRadius: `${token.borderRadius}px`,
        }}
        bordered={false}
        rowKey={"sha"}
        // @ts-ignore
        columns={columns}
        pagination={{
          showTotal: (total) => t("common.total_items", { total }),
          total: projectsData?.getProjectRecords?.total,
          current,
          pageSize,
          // current: projectsData?.getProjects?.current,
          // pageSize: projectsData?.getProjects?.pageSize,
        }}
        dataSource={projectsData?.getProjectRecords?.data || []}
        onChange={(val) => {
          setCurrent(val.current || 1);
          setPageSize(val.pageSize || 10);
          // setKeyword(keyword);
        }}
      />

      <ProjectRecordDetailDrawer open={open} onClose={onClose} sha={sha} />
    </div>
  );
};

export default ProjectOverviewPage;
