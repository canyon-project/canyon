// export const dynamic = 'force-static'
// import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  // const users = await prisma.user.findMany();
  const session = await auth();
  // console.log(session.user);
  return Response.json(session.user);
}
