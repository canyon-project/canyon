// export const dynamic = 'force-static'
import prisma from "@/lib/prisma";
// import {decompressedData} from "@/utils/zstd";

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // const projectID = searchParams.get("project_id");
  prisma.coverage.findFirst({
    where:{
      id:{
        c
      }
    }
  })
  const p = await prisma.project.findFirst({
    where: {
      id: {
        con,
      },
    },
  });
  return Response.json(p);
}
