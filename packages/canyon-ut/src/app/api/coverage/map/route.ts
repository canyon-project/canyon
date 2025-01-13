import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import zlib from "node:zlib";

async function decompressedData<T>(compressedData: Buffer): Promise<T> {
    if (!compressedData || compressedData.length === 0) {
        // @ts-ignore
        return {};
    }
    // console.log(compressedData.length,'compressedData')
    const decompressed = zlib.brotliDecompressSync(compressedData);
    return JSON.parse(decompressed.toString());
}


export async function GET(request: NextRequest) {
    const data=await prisma.utCoverage.findFirst({
        where: {
            sha: "14219242515a546ebc74b7949b5a2faea8d91b0d",
            // projectID: "456",
            // covType: "agg",
            // reportID: "789",
        },
        // @ts-ignore
    }).then(r=>decompressedData(r.hit));
    return Response.json(data);
}
