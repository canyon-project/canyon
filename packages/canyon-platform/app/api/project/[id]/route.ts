import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const provider = pathname.split("/")[2];
  const id = pathname.split("/")[3];
  const slug = pathname.split("/")[4];

  const project = await prisma.project.findFirst({
    where: {
      id: `${provider}-${id}-${slug}`,
    },
  });
  return Response.json(project);
}
