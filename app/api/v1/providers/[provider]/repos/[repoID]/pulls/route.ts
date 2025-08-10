import { NextResponse } from "next/server";

type RouteParams = {
  provider: string;
  repoID: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  const { provider, repoID } = await params;
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
  return NextResponse.json({ provider, repoID, page, pageSize, pulls: [] });
}


