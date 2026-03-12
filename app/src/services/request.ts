import axios from "axios";
import { notification } from "antd";

/** 统一请求实例：带 cookie，适用于当前前端与后端同域或代理场景 */
export const request = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (
      err as {
        response?: { data?: { error?: string; message?: string | string[] }; status?: number };
      }
    ).response;
    const data = res?.data;
    if (data?.error && typeof data.error === "string") return data.error;
    const msg = data?.message;
    if (Array.isArray(msg) && msg[0]) return msg[0];
    if (typeof msg === "string") return msg;
    if (res?.status) return `请求失败: ${res.status}`;
  }
  if (err instanceof Error) return err.message;
  return "请求失败";
}

request.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = extractErrorMessage(err);
    notification.error({
      message: "请求错误",
      description: msg,
      placement: "topRight",
    });
    return Promise.reject(err);
  },
);

export default request;
