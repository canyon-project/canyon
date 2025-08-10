import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

type RouteParams = {
    provider: string;
    repoID: string;
};

export async function GET(
    _request: Request,
    { params }: { params: Promise<RouteParams> }
) {


    const [total, rows] = await Promise.all([
        prisma.repo.count(),
        prisma.repo.findMany({
            // skip: (page - 1) * pageSize,
            // take: pageSize,
            orderBy: { createdAt: "desc" },
        }),
    ]);

    return NextResponse.json({
        data:rows,
        total
    });
}


