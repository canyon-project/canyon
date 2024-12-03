import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const projectID = pathname.split("/")[3];

  const project = await prisma.project.findFirst({
    where: {
      id: {
        contains: projectID,
      },
    },
  });
  return Response.json(project);
}
