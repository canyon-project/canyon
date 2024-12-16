import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const id = pathname.split("/")[3];
  const project = await prisma.project.findFirst({
    where: {
      id: id,
    },
  });
  return Response.json(project);
}
