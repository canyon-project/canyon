// export const dynamic = 'force-static'
import prisma from "@/lib/prisma";
// import {decompressedData} from "@/utils/zstd";

import { NextRequest } from "next/server";
import { percent } from "canyon-data";

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // const projectID = searchParams.get("project_id");
  // const sha = searchParams.get("sha");
  // const filepath = searchParams.get("filepath");
  // console.log(pathname.split('/')[3],'request.nextUrl')
  const projectID = pathname.split("/")[3];

  const coverages = await prisma.coverage
    .findMany({
      where: {
        projectID: projectID,
        covType: "all",
      },
      select: {
        sha: true,
        projectID: true,
        statementsCovered: true,
        statementsTotal: true,
        updatedAt: true,
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
          times: 0,
          statements: percent(item.statementsCovered, item.statementsTotal),
          message: "message",
          branch: "branch",
          lastReportTime: item.updatedAt,
        };
      });
    });

  return Response.json(coverages);
}
