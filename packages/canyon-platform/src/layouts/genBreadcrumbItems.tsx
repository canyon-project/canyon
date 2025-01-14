import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
function matchPattern(str: string) {
  if (
    str.includes("projects") &&
    str.split("/").length === 3 &&
    !["new"].includes(str.split("/")[2])
  ) {
    return true;
  }
}

export function genBreadcrumbItems(pathname: string) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const nav = useNavigate();
  if (matchPattern(pathname)) {
    return [
      {
        title: <span className={"cursor-pointer"}>{t("menus.projects")}</span>,
        onClick() {
          nav("/projects");
        },
      },
      {
        title: t("projects.overview"),
      },
    ];
  } else if (pathname.includes("commits")) {
    return [
      {
        title: <span className={"cursor-pointer"}>{t("menus.projects")}</span>,
        onClick() {
          nav("/projects");
        },
      },
      {
        title: (
          <span className={"cursor-pointer"}>{t("projects.overview")}</span>
        ),
        onClick() {
          const regex = /\/projects\/(.+?)\//;
          // const regex = /\/projects\/(\d+)\//;
          const match = pathname.match(regex);
          if (match) {
            const projectId = match[1];
            nav(`/projects/${projectId}`);
          } else {
            console.log("未找到匹配的项目ID");
          }
        },
      },
      {
        title: t("projects.coverage_details"),
        // title: 'Coverage Details',
      },
    ];
  } else if (
    pathname.includes("settings") &&
    pathname.split("/").length === 4
  ) {
    return [
      {
        title: <span className={"cursor-pointer"}>{t("menus.projects")}</span>,
        onClick() {
          nav("/projects");
        },
      },
      {
        title: (
          <span className={"cursor-pointer"}>{t("projects.overview")}</span>
        ),
        onClick() {
          const regex = /\/projects\/(.+?)\//;
          // const regex = /\/projects\/(\d+)\//;
          const match = pathname.match(regex);
          if (match) {
            const projectId = match[1];
            nav(`/projects/${projectId}`);
          } else {
            console.log("未找到匹配的项目ID");
          }
        },
      },
      {
        title: "项目配置",
        // title: 'Coverage Details',
      },
    ];
  } else {
    return [];
  }
}
