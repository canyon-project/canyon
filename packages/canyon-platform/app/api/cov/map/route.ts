import prisma from "@/lib/prisma";
import { decompressedData } from "@/utils/zstd";
import { formatReportObject, remapCoverage } from "@/utils/coverage";
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
    },
  });

  const d = await decompressedData(data.map);

  const c = await decompressedData(data.hit);

  const obj = {};

  for (const key in d) {
    if (c[key]) {
      obj[key] = {
        ...d[key],
        ...c[key],
        path: key,
      };
    }
  }
  function addInstrumentCwd(cov) {
    const o = {};
    for (const key in cov) {
      o[data.instrumentCwd + "/" + key] = {
        ...cov[key],
        path: data.instrumentCwd + "/" + key,
      };
    }
    return o;
  }
  const r = await remapCoverage(addInstrumentCwd(obj)).then((r) =>
    formatReportObject({
      coverage: r,
      instrumentCwd: data.instrumentCwd,
    }),
  );
  return Response.json(
    Object.entries(r.coverage)
      .filter(([key, value]) => (filepath === null ? true : key === filepath))
      .reduce((acc, [key, value]) => {
        return {
          ...acc,
          [key]: value,
        };
      }, {}),
  );
}
