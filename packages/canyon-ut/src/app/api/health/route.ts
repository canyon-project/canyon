import {NextRequest, NextResponse} from "next/server";

const healthCheckHandler = (_req: NextRequest) => {

  return NextResponse.json('success');
}

export { healthCheckHandler as GET };
