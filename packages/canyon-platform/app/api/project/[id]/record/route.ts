// export const dynamic = 'force-static'
import prisma from "@/lib/prisma";
// import {decompressedData} from "@/utils/zstd";

import { NextRequest } from "next/server";

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
      },
    })
    .then((r) => {
      return r.map((item) => {
        return {
          sha: item.sha,
          projectID: item.projectID,
          times: 0,
          statements: 0,
          message: "message",
          branch: "branch",
        };
      });
    });

  return Response.json(coverages);
}
