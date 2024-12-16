import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { decompressedData } from "@/utils/zstd";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const projectID = searchParams.get("project_id");
  const sha = searchParams.get("sha");
  const reportID = searchParams.get("report_id");
  // const [provider, id, slug] = projectID.split("-");
  console.log(projectID,'projectID')
  const coverage = await prisma.coverage.findFirst({
    where: {
      projectID: projectID,
      sha: sha,
    },
  });

  // coverage.summary
  const summary = await decompressedData(coverage.summary);
  return Response.json(
    Object.entries(summary).map(([key, value]) => {
      return {
        ...value,
        path: key,
      };
    }),
  );
}
