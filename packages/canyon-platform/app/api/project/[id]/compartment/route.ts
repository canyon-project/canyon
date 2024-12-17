import prisma from "@/lib/prisma";

import { NextRequest } from "next/server";
import { percent } from "canyon-data";
import dayjs from "dayjs";

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
      },
      orderBy: {
        updatedAt: "desc",
      },
    })
    .then((r) => {
      return r.map((item) => {
        return {
          sha: item.sha,
          projectID: item.projectID,
          statements: percent(item.statementsCovered, item.statementsTotal),
          branch: item.branch,
          lastReportTime: item.updatedAt,
          covType: item.covType,
        };
      });
    });

  const maxCoverage = Math.max(
    ...coverages
      .filter((item) => item.covType === "all")
      .map((item) => item.statements),
  );
  const totalTimes = coverages.filter((item) => item.covType === "all").length;

  const latest = coverages.filter((item) => item.covType === "agg")[0];
  return Response.json([
    {
      label: "projects.total_times",
      value: String(totalTimes),
    },
    {
      label: "projects.max_coverage",
      value: maxCoverage + "%",
    },
    {
      label: "projects.latest_report_time",
      value: dayjs(latest.lastReportTime).format("MM-DD HH:mm"),
    },
    {
      label: "projects.latest_report_coverage",
      value: latest.statements + "%",
    },
  ]);
}
