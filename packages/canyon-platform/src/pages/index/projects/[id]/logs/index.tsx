import ProjectLogsChart from "@/pages/index/projects/[id]/logs/helper/Chart.tsx";
import { GetCoverageLogsDocument } from "@/helpers/backend/gen/graphql.ts";
import { useQuery } from "@apollo/client";

const dataSource = [
  {
    key: "1",
    name: "胡彦斌",
    age: 32,
    address: "西湖区湖底公园1号",
  },
  {
    key: "2",
    name: "胡彦祖",
    age: 42,
    address: "西湖区湖底公园1号",
  },
];

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Project ID",
    dataIndex: "projectID",
    key: "projectID",
  },
  {
    title: "Sha",
    dataIndex: "sha",
    key: "sha",
    render: (text) => {
      return text.slice(0, 7);
    },
  },
  {
    title: "Report ID",
    dataIndex: "reportID",
    key: "reportID",
    //   省略
    ellipsis: true,
  },
  {
    title: "Size",
    dataIndex: "size",
    key: "size",
  },
  {
    title: "Tags",
    dataIndex: "tags",
    render: (tags) => {
      return tags.map((tag) => {
        return (
          <Tag color="blue" key={tag.value}>
            {tag.label}
          </Tag>
        );
      });
    },
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
  },
];

const ProjectLogsPage = () => {
  // GetReportLogs
  // projectID 可选
  // sha 可选
  // reportID 可选
  // tags 可选 {name:'zt'}
  const { data } = useQuery(GetCoverageLogsDocument);
  return (
    <div>
      <Table dataSource={data?.getCoverageLogs.data || []} columns={columns} />
      {/*<ProjectLogsChart />*/}
    </div>
  );
};

export default ProjectLogsPage;
