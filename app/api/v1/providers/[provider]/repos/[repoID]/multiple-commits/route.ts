import { NextResponse } from "next/server";

type RouteParams = {
  provider: string;
  repoID: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  const { provider, repoID } = await params;
  const body = await request.json().catch(() => ({}));
  // 期望 body: { shas: string[] }
  return NextResponse.json({ provider, repoID, body, result: [] });
}


