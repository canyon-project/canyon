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
