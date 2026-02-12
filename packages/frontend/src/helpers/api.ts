/**
 * 从后端错误响应中解析出展示用的文案（约定：Nest 返回 { message: string | string[] }）
 */
export async function getApiErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const msg = body?.message;
    if (Array.isArray(msg)) return msg[0] ?? `请求失败: ${res.status}`;
    if (typeof msg === 'string') return msg;
  } catch {
    // 非 JSON 或解析失败
  }
  return `请求失败: ${res.status}`;
}

/**
 * 从 axios 错误中解析展示文案（err.response?.data?.message）
 */
export function getAxiosErrorMessage(err: unknown): string | null {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string | string[] }; status?: number } })
      .response;
    const msg = res?.data?.message;
    if (Array.isArray(msg) && msg[0]) return msg[0];
    if (typeof msg === 'string') return msg;
    if (res?.status) return `请求失败: ${res.status}`;
  }
  if (err instanceof Error) return err.message;
  return null;
}
