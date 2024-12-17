// export const dynamic = 'force-static'
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const users = await prisma.sysSetting.findFirst({
    where: {
      key: "SDK",
    },
  });

  return Response.json(users);
}

export async function PUT(request: NextRequest) {
  const { value } = await request.json();
  const updatedSetting = await prisma.sysSetting.updateMany({
    where: {
      key: "SDK",
    },
    data: {
      value: value,
    },
  });
  return Response.json(updatedSetting);
}
