import prisma from "@/lib/prisma";
import { getFileInfo } from "@/utils/gitlab.adapter";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const projectID = searchParams.get("project_id");
  const sha = searchParams.get("sha");
  const filepath = searchParams.get("filepath");

  const gitProvider = await prisma.gitProvider.findFirst({
    where: {
      disabled: false,
    },
  });

  try {
    const r = await getFileInfo(
      {
        projectID: projectID,
        filepath: encodeURIComponent(filepath),
        commitSha: sha,
      },
      gitProvider?.privateToken,
      gitProvider?.url,
    );
    return Response.json(r);
  } catch (e) {
    return Response.json({
      content: "error",
    });
  }
}
// bb5adc06534d19947e6bfc97e3eeecfd55564bed
