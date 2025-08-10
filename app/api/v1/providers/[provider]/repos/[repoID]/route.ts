import { NextResponse } from "next/server";

type RouteParams = {
  provider: string;
  repoID: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  const { provider, repoID } = await params;
  return NextResponse.json({ provider, repoID });
}


