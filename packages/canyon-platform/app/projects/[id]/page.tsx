"use client";

import {
  Divider,
  Input,
  Popconfirm,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  theme,
} from "antd";
import { ColumnsType } from "antd/es/table";
// import { AimOutlined, BranchesOutlined } from "@ant-design/icons";
import Link from "next/link";
import MainBox from "@/components/main-box";
const getProjectCompartmentData = [
  {
    label: "name",
    value: "100",
  },
  {
    label: "name",
    value: "100",
  },
  {
    label: "name",
    value: "100",
  },
  {
    label: "name",
    value: "100",
  },
];
const { useToken } = theme;
const t = (msg) => msg;
const ProjectOverviewPage = () => {
  const { token } = useToken();
  const columns: ColumnsType<any> = [
    {
      title: (
        <div>
          {/*<Icon component={MaterialSymbolsCommitSharp} className={"mr-1"} />*/}
          Sha
        </div>
      ),
      dataIndex: "sha",
      width: "100px",
      render(_, { webUrl }): JSX.Element {
        return (
          <a href={webUrl} target={"_blank"} rel="noreferrer">
            {_?.slice(0, 7)}
          </a>
        );
      },
    },
    {
      title: (
        <>
          {/*<BranchesOutlined className={"mr-1"} />*/}
          {"projects.branch"}
        </>
      ),
      dataIndex: "branch",
      ellipsis: true,
      width: "120px",
    },
    {
      title: (
        <>
          {/*<AimOutlined className={"mr-1"} />*/}
          {"projects.compare_target"}
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
    {
      title: <>{"Build"}</>,
      align: "center",
      width: "70px",
      render(_, record) {
        return (
          <>
            {record.buildID !== "-" ? (
              <a href={record.buildURL} target={"_blank"} rel="noreferrer">
                <img
                  className={"w-[16px]"}
                  src={`/gitproviders/${record.buildProvider === "-" ? "gitlab" : record.buildProvider}.svg`}
                  alt=""
                />
              </a>
            ) : (
              <span>-</span>
            )}
          </>
        );
      },
    },
    {
      title: t("projects.message"),
      dataIndex: "message",
      width: "160px",
      ellipsis: true,
    },
    {
      title: (
        <div>
          {/*<Tooltip title={t("projects.statements_tooltip")} className={"mr-2"}>*/}
          {/*  <QuestionCircleOutlined />*/}
          {/*</Tooltip>*/}
          {"projects.statements"}
        </div>
      ),
      dataIndex: "statements",
      // width: '148px',
      render(_, { sha }) {
        return (
          <Link
            to={{
              pathname: `/projects/${"pam.id"}/commits/${sha}`,
            }}
          >
            {_}%
          </Link>
        );
      },
      // width: '150px',
      // render(_, { sha }) {
      //   return (
      //     <div className={'flex'}>
      //       <Link
      //         // style={{border:'1px solid #000'}}
      //         className={'block w-[60px]'}
      //         to={{
      //           pathname: `/projects/${pam.id}/commits/${sha}`,
      //         }}
      //       >
      //         {_}%
      //       </Link>
      //       <Popover content={content} title="Title">
      //         <img src={im} alt='coverage'/>
      //       </Popover>
      //
      //     </div>
      //   );
      // },
    },
    {
      title: (
        <div>
          {/*<Tooltip title={t("projects.newlines_tooltip")} className={"mr-2"}>*/}
          {/*  <QuestionCircleOutlined />*/}
          {/*</Tooltip>*/}
          {"projects.newlines"}
        </div>
      ),
      dataIndex: "newlines",
      // width: '130px',
      render(_, { sha }) {
        return (
          <Link
            to={{
              pathname: `/projects/${"pam.id"}/commits/${sha}`,
            }}
          >
            {_}%
          </Link>
        );
      },
    },
    {
      title: "projects.report_times",
      dataIndex: "times",
      width: "80px",
    },
    {
      title: "projects.latest_report_time",
      dataIndex: "lastReportTime",
      width: "135px",
      render(_) {
        return <span>{"MM-DD HH:mm"}</span>;
      },
    },
    {
      title: "common.option",
      width: "125px",
      render(_): JSX.Element {
        return (
          <div>
            <a
              onClick={() => {
                // setOpen(true);
                // setSha(_.sha);
              }}
            >
              {"projects.reported_details"}
            </a>
            <Divider type={"vertical"} />

            <Popconfirm
              title="Delete the project record"
              description="Are you sure to delete this project record?"
              onConfirm={() => {}}
              onCancel={() => {
                console.log("cancel");
              }}
              okText="Yes"
              cancelText="No"
            >
              <a className={"text-red-500 hover:text-red-600"}>
                {"common.delete"}
              </a>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <MainBox>
      <div className={"mb-10"}>
        <div className={"flex"}>
          <span>biaoti</span>
        </div>

        <div>
          项目Id
          <span className={"ml-6"}>
            {"projects.default.branch"}: {"main"}
          </span>
        </div>

        <Tag>test</Tag>
      </div>

      <span className={"block mb-3"} style={{ fontWeight: 500, fontSize: 16 }}>
        {"projects.overview"}
      </span>

      <div className={"flex mb-10"}>
        <Spin spinning={false}>
          <div
            className={`[list-style:none] grid grid-cols-[repeat(2,_215px)] grid-rows-[repeat(2,_1fr)] gap-[16px] h-full mr-[16px]`}
          >
            {(getProjectCompartmentData || []).map((item, index) => {
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
                  <span>{item.label}</span>
                  <span className={"text-xl"}>{item.value}</span>
                </div>
              );
            })}
          </div>
        </Spin>

        <div style={{ flex: 1 }}>
          <Spin spinning={false}>
            <div
              className={"p-[18px] bg-white dark:bg-[#0C0D0E]"}
              style={{
                border: `1px solid ${token.colorBorder}`,
                borderRadius: `${token.borderRadius}px`,
              }}
            >
              <div className={"flex items-center"}>
                <span level={5} style={{ marginBottom: "0" }}>
                  {"projects.trends_in_coverage"}
                </span>
                <span
                  type={"secondary"}
                  className={"ml-2"}
                  style={{ fontSize: 12 }}
                >
                  {"projects.trends.tooltip"}
                </span>
              </div>
              {/*<ReactECharts*/}
              {/*  theme={*/}
              {/*    localStorage.getItem("theme") === "dark"*/}
              {/*      ? "dark"*/}
              {/*      : {*/}
              {/*        color: ["#287DFA", "#FFB400"],*/}
              {/*      }*/}
              {/*  }*/}
              {/*  style={{height: "254px"}}*/}
              {/*  option={option}*/}
              {/*/>*/}
            </div>
          </Spin>
        </div>
      </div>

      <span className={"block mb-3"} style={{ fontWeight: 500, fontSize: 16 }}>
        {"projects.records"}
      </span>
      <div
        className={"flex"}
        style={{ marginBottom: "16px", justifyContent: "space-between" }}
      >
        <div className={"flex items-center gap-5"}>
          <Input.Search
            defaultValue={"keyword"}
            placeholder={"projects.overview_search_keywords"}
            onSearch={(value) => {
              // setKeyword(value);
              // setCurrent(1);
            }}
            style={{ width: "600px" }}
          />
          <Space>
            <span type={"secondary"}>{"projects.only.default.branch"}: </span>
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
                // setDefaultBranchOnly(v);
              }}
            />
          </Space>
        </div>
      </div>
      {/*div*/}
      <Table
        loading={false}
        style={{
          border: `1px solid ${token.colorBorder}`,
          borderRadius: `${token.borderRadius}px`,
        }}
        bordered={false}
        rowKey={"sha"}
        columns={columns}
        pagination={
          {
            // showTotal: (total) => t("common.total_items", {total}),
            // total: projectsData?.getProjectRecords?.total,
            // current,
            // pageSize,
            // current: projectsData?.getProjects?.current,
            // pageSize: projectsData?.getProjects?.pageSize,
          }
        }
        dataSource={[]}
        onChange={(val) => {
          // setCurrent(val.current || 1);
          // setPageSize(val.pageSize || 10);
          // setKeyword(keyword);
        }}
      />

      {/*默太狂就共用一个*/}
      {/*<ProjectRecordDetailDrawer open={open} onClose={onClose} sha={sha}/>*/}
    </MainBox>
  );
};

export default ProjectOverviewPage;
