import prisma from "@/lib/prisma";

import { NextRequest } from "next/server";
import { percent } from "canyon-data";
import axios from "axios";

async function getCommits(projectID: string, shas: string[]) {
  const [provider, id, slug] = projectID.split("-");
  const gitProvider = await prisma.gitProvider.findFirst({
    where: {
      id: provider,
    },
  });

  if (gitProvider) {
    // TODO: 从gitlab获取文件内容，还去要判断provider type，例如github。
    // 判断provider类型，例如gitlab、github、gitea

    switch (gitProvider.type) {
      case "gitlab":
        const { url: gitlabUrl, privateToken: gitlabPrivateToken } =
          gitProvider;
        return Promise.all(
          shas.map((sha) =>
            axios
              .get(
                `${gitlabUrl}/api/v4/projects/${id}/repository/commits/${sha}`,
                {
                  params: {
                    ref: sha,
                  },
                  headers: {
                    "private-token": gitlabPrivateToken,
                  },
                },
              )
              .then(({ data }) => data),
          ),
        );
      case "github":
        return [];
      case "gitea":
        return [];
      default:
        return [];
    }
  } else {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const id = pathname.split("/")[3];

  const coverages = await prisma.coverage
    .findMany({
      where: {
        projectID: id,
      },
      select: {
        sha: true,
        projectID: true,
        statementsCovered: true,
        statementsTotal: true,
        updatedAt: true,
        branch: true,
        covType: true,
        reportID: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })
    .then((r) => {
      return r.map((item) => {
        return {
          ...item,
          statements: percent(item.statementsCovered, item.statementsTotal),
          lastReportTime: item.updatedAt,
          // message: "message",
        };
      });
    });

  const rows = coverages
    .filter((item) => item.covType === "all")
    .map((item) => ({
      ...item,
      aggs: [],
    }));

  // 获取gitlab commit message

  const shas = await getCommits(
    id,
    rows.map((item) => item.sha),
  );

  const aggs = coverages.filter((item) => item.covType === "agg");

  for (let i = 0; i < aggs.length; i++) {
    const row = rows.find((item) => item.sha === aggs[i].sha);
    if (row) {
      row.aggs.push(aggs[i]);
    }
  }

  return Response.json(
    rows.map((item) => ({
      ...item,
      times: item.aggs.length,
      message: shas.find((sha) => sha.id === item.sha)?.message,
    })),
  );
}
