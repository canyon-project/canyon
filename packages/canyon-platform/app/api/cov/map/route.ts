import prisma from "@/lib/prisma";
import { decompressedData } from "@/utils/zstd";
import {
  formatReportObject,
  remapCoverage,
  reorganizeCompleteCoverageObjects,
} from "@/utils/coverage";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const projectID = searchParams.get("project_id");
  const sha = searchParams.get("sha");
  const filepath = searchParams.get("filepath");
  const data = await prisma.coverage.findFirst({
    where: {
      projectID: projectID,
      sha: sha,
      covType: "all",
    },
  });

  const hitdata = await prisma.coverage.findFirst({
    where: {
      projectID: projectID,
      sha: sha,
      covType: "all",
    },
  });

  const d = await decompressedData(data.map);

  const c = await decompressedData(hitdata.hit);

  const obj = reorganizeCompleteCoverageObjects(d, c);

  return Response.json(
    Object.entries(obj)
      .filter(([key, value]) => (filepath === null ? true : key === filepath))
      .reduce((acc, [key, value]) => {
        return {
          ...acc,
          [key]: value,
        };
      }, {}),
  );
}
