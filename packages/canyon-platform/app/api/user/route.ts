import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({
      id: null,
      name: null,
      email: null,
    });
  }
  return Response.json(session.user);
}
