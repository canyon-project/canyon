"use client";
import { Button, Table, theme } from "antd";
import useSWR from "swr";
import axios from "axios";
import MainBox from "@/components/wget/layout/main-box";
import { FolderOutlined, PlusOutlined } from "@ant-design/icons";
import { TextTypography } from "@/components/wget";
import Link from "next/link";
import withTheme from "@/theme";
// import prisma from "@/lib/prisma";
// import Icon, {LeftOutlined} from "@ant-design/icons";

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
    title: "Org",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Last Reported",
    dataIndex: "address",
    key: "address",
  },
  // Last Reported
];
const ProjectsPage = () => {
  const { token } = useToken();
  // const users = await prisma.user.findMany();
  // console.log(users.length);
  const { data, error, isLoading } = useSWR("/api/project", fetcher);

  return (
    <MainBox>
      <TextTypography
        title={"Projects"}
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
