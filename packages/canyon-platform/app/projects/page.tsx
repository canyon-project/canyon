"use client";
import dayjs from "dayjs";
import { Button, Table, theme } from "antd";
import useSWR from "swr";
import axios from "axios";
import MainBox from "@/components/wget/layout/main-box";
import { FolderOutlined, PlusOutlined } from "@ant-design/icons";
import { TextTypography } from "@/components/wget";
import Link from "next/link";
import withTheme from "@/theme";
import { useTranslations } from "next-intl";

const { useToken } = theme;
const Rs = () => (
  <span
    style={{ display: "inline-flex" }}
    className="icon-[emojione-v1--lightning-mood]"
  />
);

const fetcher = (url) => axios(url).then((res) => res.data);

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Repo",
    dataIndex: "pathWithNamespace",
    key: "pathWithNamespace",
  },
  {
    title: "Report Times",
    dataIndex: "reportTimes",
    key: "reportTimes",
  },
  {
    title: "Last Reported",
    dataIndex: "lastReportTime",
    key: "lastReportTime",
    render: (text) => {
      return <span>{dayjs(text).format("MM-DD HH:mm")}</span>;
    },
  },
  {
    title: "Option",
    key: "option",
    render: (_, { id }) => (
      <>
        <Link href={`/projects/${id.split("-").join("/")}`}>
          <>Detail</>
        </Link>
      </>
    ),
  },
  // Last Reported
];
const ProjectsPage = () => {
  const { token } = useToken();
  const { data, error, isLoading } = useSWR("/api/project", fetcher);
  const t = useTranslations();
  return (
    <MainBox>
      <TextTypography
        title={t("projects.trends.tooltip")}
        icon={<FolderOutlined />}
        right={
          <Link href={`/projects/new`}>
            <Button type={"primary"} icon={<PlusOutlined />}>
              Create a Project
            </Button>
          </Link>
        }
      />
      <div
        className={"rounded-[8px] overflow-hidden"}
        style={{
          border: `1px solid ${token.colorBorder}`,
          boxShadow: `${token.boxShadowTertiary}`,
        }}
      >
        <Table dataSource={data?.data || []} columns={columns} />
      </div>
    </MainBox>
  );
};

export default () => withTheme(<ProjectsPage />);
