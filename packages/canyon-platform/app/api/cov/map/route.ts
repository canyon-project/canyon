import prisma from "@/lib/prisma";
import { decompressedData } from "@/utils/zstd";
import { NextRequest } from "next/server";
import {
  remapCoverageWithInstrumentCwd,
  reorganizeCompleteCoverageObjects,
  resetCoverageDataMap,
} from "canyon-data2";

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

  const map = await decompressedData(data.map);

  const hit = await decompressedData(hitdata.hit);

  const reMapMap = await remapCoverageWithInstrumentCwd(
    resetCoverageDataMap(map),
    hitdata.instrumentCwd,
  );

  const obj = reorganizeCompleteCoverageObjects(reMapMap, hit);

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
