import {Breadcrumb, Button, Divider, message, Tabs, Typography} from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import RIf from "@/components/RIf.tsx";
import BasicLayout from "@/layouts/BasicLayout.tsx";
import { getRepo } from "@/services/repo";
import {SettingOutlined} from "@ant-design/icons";

type Repo = {
  id: string;
  pathWithNamespace: string;
  description: string;
  tags: string;
  members: string;
  config: string;
  createdAt: string;
  updatedAt: string;
};

const ProjectDetailPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [repo, setRepo] = useState<Repo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepo = async () => {
      if (!params.org || !params.repo || !params.provider) return;
      setLoading(true);
      try {
        const repoId = `${params.org}/${params.repo}`;
        const { data } = await getRepo(repoId, params.provider);
        setRepo(data);
      } catch (error: unknown) {
        const status = (error as { response?: { status: number } })?.response?.status;
        if (status === 404) {
          message.error(t("projects.detail.repo.not.found"));
        } else {
          message.error(t("projects.detail.repo.fetch.failed"));
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepo();
  }, [params.org, params.repo, t]);

  return (
    <BasicLayout>
      <RIf condition={!loading && repo !== null}>
        <div className={"flex h-[48px] items-center justify-between gap-4"}>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1">
            <Breadcrumb
              items={[
                {
                  title: t("menus.projects"),
                  href: "/projects",
                },
                {
                  title: params.repo,
                  href: `/${params.provider}/${params.org}/${params.repo}/compare`,
                },
              ]}
            />
            {repo ? (
              <Typography.Text type="secondary" className="text-sm">
                {t("projects.detail.repo_id")}{" "}
                <Typography.Text code copyable={{ text: repo.id }} className="text-xs">
                  {repo.id}
                </Typography.Text>
              </Typography.Text>
            ) : null}
          </div>

          <Button
            size={'small'}
            icon={<SettingOutlined/>}
            type={'primary'}
            onClick={() =>
              navigate(
                `/${params.provider}/${params.org}/${params.repo}/settings`,
              )
            }
          />
        </div>
        <Divider style={{ margin: "0" }} />
        {!location.pathname.includes("/settings") && (
          <Tabs
            activeKey={
              location.pathname.includes("/compare")
                ? "compare"
                : location.pathname.includes("/multiple-commits")
                  ? "multiple-commits"
                  : "commits"
            }
            onChange={(key) => {
              navigate(`/${params.provider}/${params.org}/${params.repo}/${key}`);
            }}
            items={[
              {
                key: "compare",
                label: t("projects.detail.tabs.comparison"),
              },
              { key: "commits", label: t("projects.detail.tabs.commits") },
            ]}
          />
        )}
        <Outlet
          context={{
            repo: repo,
          }}
        />
      </RIf>
    </BasicLayout>
  );
};

export default ProjectDetailPage;
