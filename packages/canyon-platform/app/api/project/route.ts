// export const dynamic = 'force-static'
// import prisma from "@/lib/prisma";
// import {decompressedData} from "@/utils/zstd";

export async function GET() {
  return Response.json({
    data: [
      {
        id: "id",
        pathWithNamespace: "canyon/canyon",
        description: "sss",
        lastReported: "2024-04-30",
      },
    ],
  });
}
