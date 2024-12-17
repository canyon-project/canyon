import prisma from "@/lib/prisma";

import { NextRequest } from "next/server";
import { percent } from "canyon-data";

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const id = pathname.split("/")[3];

  const coverages = await prisma.coverage
    .findMany({
      where: {
        projectID: id,
        covType: "all",
      },
      select: {
        sha: true,
        projectID: true,
        statementsCovered: true,
        statementsTotal: true,
        updatedAt: true,
        branch: true,
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
        };
      });
    });

  return Response.json(coverages);
}
