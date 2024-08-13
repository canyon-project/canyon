import { useQuery } from "@apollo/client";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { GetProjectRecordDetailByShaDocument } from "../../helpers/backend/gen/graphql.ts";
const { Text } = Typography;

const ProjectRecordDetailDrawer = ({ open, onClose, sha }: any) => {
  const pam = useParams();
  const { data, loading } = useQuery(GetProjectRecordDetailByShaDocument, {
    variables: {
      projectID: pam.id as string,
      sha: sha,
    },
  });

  const { t } = useTranslation();
  // const pam = useParams();
  const columns = [
    {
      title: t("projects.coverage_id"),
      dataIndex: "id",
    },
    {
      title: t("projects.report_id"),
      dataIndex: "reportID",
      render(_: any): JSX.Element {
        // 标识位（勿动）
        return <div className={"text-ellipsis w-[240px]"}>{_}</div>;
      },
    },
    {
      title: t("projects.statements"),
      dataIndex: "statements",
      render(_: any): JSX.Element {
        return <span>{_}%</span>;
      },
    },
    {
      title: t("projects.newlines"),
      dataIndex: "newlines",
      render(_: any): JSX.Element {
        return <span>{_}%</span>;
      },
    },
    {
      title: t("projects.reporter"),
      dataIndex: "reporterUsername",
      render(_: any, t: any): any {
        return (
          <div>
            <Avatar src={t.reporterAvatar} />
            <Text style={{ marginLeft: "10px" }}>{t.reporterUsername}</Text>
          </div>
        );
      },
    },
    {
      title: t("projects.report_time"),
      dataIndex: "lastReportTime",
      render(_: any) {
        return dayjs(_).format("MM-DD HH:mm");
      },
    },
    {
      title: t("common.option"),
      render(_: any) {
        return (
          <div>
            <Link
              to={{
                pathname: `/projects/${pam.id}/commits/${_.sha}`,
                search: `?report_id=${_.reportID}`,
              }}
            >
              {t("common.detail")}
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Drawer
        title={t("projects.reported_details") + "-" + sha}
        placement="right"
        width={"85%"}
        onClose={onClose}
        open={open}
      >
        <Table
          loading={loading}
          size={"small"}
          rowKey={"id"}
          columns={columns}
          dataSource={data?.getProjectRecordDetailBySha || []}
        />
      </Drawer>
    </>
  );
};

export default ProjectRecordDetailDrawer;
