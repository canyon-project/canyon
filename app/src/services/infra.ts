import { request } from "./request";

export type ProviderItem = {
  provider: string;
  type: "gitlab" | "github";
  baseUrl: string;
};

/**
 * 获取已配置的 Provider 列表
 */
export function getProviders() {
  return request
    .get<{ providers: ProviderItem[] }>("/api/infra/providers")
    .then((res) => res.data.providers);
}
