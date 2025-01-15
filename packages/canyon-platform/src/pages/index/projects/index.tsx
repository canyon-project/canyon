import {
  FolderOutlined,
  HeartFilled,
  HeartOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { ColumnsType } from "antd/es/table";
import { TextTypography } from "../../../components/ui";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { CanyonCardPrimary } from "../../../components/old-ui";
import {
  // DeleteProjectDocument,
  FavorProjectDocument,
  GetProjectsBuOptionsDocument,
  GetProjectsDocument,
  GetProjectsTagOptionsDocument,
  Project,
} from "../../../helpers/backend/gen/graphql.ts";

const { Text } = Typography;

function countingStars(num: any) {
  if (num >= 75 && num < 80) {
    return "🌟";
  } else if (num >= 80 && num < 85) {
    return "🌟🌟";
  } else if (num >= 85 && num < 90) {
    return "🌟🌟🌟";
  } else if (num >= 90 && num < 95) {
    return "🌟🌟🌟🌟";
  } else if (num >= 95 && num <= 100) {
    return "🌟🌟🌟🌟🌟";
  }
}
const ProjectPage = () => {
  const { t } = useTranslation();
  // const [deleteProject] = useMutation(DeleteProjectDocument);
  const [favorProject] = useMutation(FavorProjectDocument);
  const columns: ColumnsType<Project> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render(text, record) {
        return (
          <Space>
            <div
              className={"favor-heart"}
              style={{
                visibility: record.favored ? "unset" : undefined,
              }}
              onClick={() => {
                favorProject({
                  variables: {
                    projectID: record.id,
                    favored: !record.favored,
                  },
                }).then(() => {
                  refetch().then(() => {
                    message.success("success");
                  });
                });
              }}
            >
              {record.favored ? (
                <HeartFilled style={{ color: "red" }} />
              ) : (
                <HeartOutlined />
              )}
            </div>
            {text.split("-")[1]}
          </Space>
        );
      },
    },
    {
      title: t("projects.slug"),
      dataIndex: "id",
      key: "slug",
      render(text) {
        return (
          <span className={"max-w-[80px] block"}>{text.split("-")[2]}</span>
        );
      },
    },
    {
      title: t("projects.name"),
      dataIndex: "pathWithNamespace",
      key: "pathWithNamespace",
      render: (text, record) => {
        return (
          <div className={"flex gap-1"}>
            <div>
              <img
                src="/gitproviders/gitlab.svg"
                alt=""
                className={"w-[16px]"}
              />
            </div>

            <span style={{ width: "4px", display: "inline-block" }}></span>
            <div className={"flex gap-1 flex-col"}>
              <a
                className={"max-w-[240px]"}
                style={{ color: "unset" }}
                target={"_blank"}
                // @ts-ignore
                href={`${window.GITLAB_URL}/${text}`}
                rel="noreferrer"
              >
                {text}
              </a>
              <Text
                type={"secondary"}
                style={{ fontSize: "12px", width: "240px" }}
              >
                {record.description}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "Bu",
      dataIndex: "bu",
      sorter: true,
    },
    {
      title: t("projects.report_times"),
      dataIndex: "reportTimes",
      sorter: true,
    },
    {
      title: (
        <>
          <Tooltip
            title={t("projects.max_coverage_tooltip")}
            className={"mr-2"}
          >
            <QuestionCircleOutlined />
          </Tooltip>
          {t("projects.max_coverage")}
        </>
      ),
      dataIndex: "maxCoverage",
      key: "maxCoverage",
      sorter: true,
      render: (text) => {
        return (
          <Space>
            {text}%{countingStars(text)}
          </Space>
        );
      },
    },
    {
      title: t("projects.latest_report_time"),
      dataIndex: "lastReportTime",
      sorter: true,
      render(_) {
        return <span>{dayjs(_).format("MM-DD HH:mm")}</span>;
      },
    },
    {
      title: t("common.option"),
      key: "option",
      render: (_, { id }) => (
        <>
          <Link
            to={{
              pathname: `/projects/${id}`,
            }}
          >
            {t("common.detail")}
          </Link>
          <Divider type={"vertical"} />
          <Link
            to={{
              pathname: `/projects/${id}/settings`,
            }}
          >
            {t("common.settings")}
          </Link>
        </>
      ),
    },
  ];
  const initBu = (() => {
    try {
      if (JSON.parse(localStorage.getItem("bu") || "[]") instanceof Array) {
        return JSON.parse(localStorage.getItem("bu") || "[]");
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  })();

  const initTag = (() => {
    return localStorage.getItem("tag") || "";
  })();
  const initFavorOnly = Boolean(localStorage.getItem("favorOnlyFilter"));
  const [keyword, setKeyword] = useState("");
  const [favorOnly, setFavorOnly] = useState(initFavorOnly);
  const [bu, setBu] = useState<string[]>(initBu);
  const [tag, setTag] = useState<string>(initTag);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorter, setSorter] = useState<any>({});

  const { data: projectsBuOptionsData } = useQuery(
    GetProjectsBuOptionsDocument,
    {
      fetchPolicy: "no-cache",
    },
  );

  const { data: projectsTagOptionsData } = useQuery(
    GetProjectsTagOptionsDocument,
    {
      fetchPolicy: "no-cache",
    },
  );

  const {
    data: projectsData,
    loading,
    refetch,
  } = useQuery(GetProjectsDocument, {
    variables: {
      current: current,
      pageSize: pageSize,
      keyword: keyword,
      bu: bu,
      tag: tag,
      lang: ["JavaScript"],
      field: sorter.field || "",
      order: sorter.order || "",
      favorOnly: favorOnly,
    },
    fetchPolicy: "no-cache",
  });

  return (
    <>
      <TextTypography
        title={t("menus.projects")}
        icon={<FolderOutlined />}
        right={
          <Link to={`/projects/new`}>
            <Button type={"primary"} icon={<PlusOutlined />}>
              {t("projects.create")}
            </Button>
          </Link>
        }
      />

      <div>
        <div className={"flex justify-between"}>
          <div>
            <Select
              defaultValue={initBu}
              mode="multiple"
              onChange={(v) => {
                setBu(v);
                localStorage.setItem("bu", JSON.stringify(v));
              }}
              placeholder={"Bu"}
              className={"w-[200px] mr-2"}
              options={(projectsBuOptionsData?.getProjectsBuOptions || []).map(
                ({ bu, count }) => ({
                  label: bu + ` ${count}`,
                  value: bu,
                }),
              )}
            />

            <Select
              allowClear={true}
              defaultValue={initTag || undefined}
              onChange={(v) => {
                setTag(v || "");
                localStorage.setItem("tag", v || "");
              }}
              placeholder={"Tag"}
              className={"w-[200px] mr-2"}
              options={(
                projectsTagOptionsData?.getProjectsTagOptions || []
              ).map(({ name }) => ({
                label: name,
                value: name,
              }))}
            />

            <Input.Search
              placeholder={t("projects.search_keywords")}
              className={"w-[420px] mb-3"}
              onSearch={(value) => {
                setKeyword(value);
                setCurrent(1);
              }}
            />
            <Space className={"ml-5"}>
              <Text type={"secondary"}>{t("common.favor.only")}: </Text>
              <Switch
                checkedChildren={<HeartFilled />}
                defaultChecked={Boolean(
                  localStorage.getItem("favorOnlyFilter"),
                )}
                onChange={(v) => {
                  if (v) {
                    localStorage.setItem("favorOnlyFilter", "1");
                  } else {
                    localStorage.removeItem("favorOnlyFilter");
                  }
                  setFavorOnly(v);
                }}
              />
            </Space>
          </div>
        </div>

        <CanyonCardPrimary>
          <Table
            showSorterTooltip={false}
            loading={loading}
            rowKey={"id"}
            pagination={{
              total: projectsData?.getProjects?.total,
              showTotal: (total) => t("common.total_items", { total }),
              current,
              pageSize,
            }}
            bordered={false}
            dataSource={projectsData?.getProjects?.data || []}
            // @ts-ignore
            columns={columns}
            onChange={(val, _, _sorter: any) => {
              setSorter({
                field: _sorter.field,
                order: _sorter.order,
              });
              setCurrent(val.current || 1);
              setPageSize(val.pageSize || 10);
            }}
          />
        </CanyonCardPrimary>
      </div>
    </>
  );
};

export default ProjectPage;
