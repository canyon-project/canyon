import prisma from "@/lib/prisma";
export async function GET() {
  const coverages = await prisma.coverage.findMany({
    where: {
      covType: "all",
    },
    select: {
      id: true,
      sha: true,
      projectID: true,
      statementsCovered: true,
      statementsTotal: true,
      updatedAt: true,
    },
  });
  const dukliID = [...new Set(coverages.map((coverage) => coverage.projectID))];

  const projects = await prisma.project.findMany({
    where: {
      id: {
        in: dukliID.map((id) => `tripgl-${id}-auto`),
      },
    },
  });

  const rows = [];

  for (const project of projects) {
    const coveragesForProject = coverages.filter((coverage) =>
      project.id.includes(coverage.projectID),
    );
    const latestCoverage = coveragesForProject.reduce(
      (prev, current) => (prev.updatedAt > current.updatedAt ? prev : current),
      {},
    );
    rows.push({
      id: project.id,
      name: project.name,
      pathWithNamespace: project.pathWithNamespace,
      // coverage: latestCoverage,
      reportTimes: coveragesForProject.length,
      lastReportTime: latestCoverage.updatedAt,
    });
  }

  return Response.json({
    data: rows,
  });
}
