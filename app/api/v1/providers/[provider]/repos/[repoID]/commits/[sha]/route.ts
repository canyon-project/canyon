import { NextResponse } from "next/server";

type RouteParams = {
  provider: string;
  repoID: string;
  sha: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  const { provider, repoID, sha } = await params;
  return NextResponse.json({ provider, repoID, sha, commit: null });
}


