import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  const { name, value } = await request.json(); // 从请求体中获取数据

  cookieStore.set(name, value);

  return new Response("Cookie set successfully");
}
