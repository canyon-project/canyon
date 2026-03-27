import { request } from "./request";

export type ProviderItem = {
  provider: string;
  type: "gitlab" | "github";
  baseUrl: string;
};

export type DbTableStat = {
  tableName: string;
  rowEstimate: number;
  totalBytes: number;
  tableBytes: number;
  indexBytes: number;
  totalSizePretty: string;
  tableSizePretty: string;
  indexSizePretty: string;
};

export type DbStatsResponse = {
  tables: DbTableStat[];
  totals: {
    tableCount: number;
    rowEstimate: number;
    totalBytes: number;
    totalSizePretty: string;
  };
};

/**
 * 获取已配置的 Provider 列表
 */
export function getProviders() {
  return request
    .get<{ providers: ProviderItem[] }>("/api/infra/providers")
    .then((res) => res.data.providers);
}

/**
 * 获取数据库表统计信息
 */
export function getDatabaseStats() {
  return request.get<DbStatsResponse>("/api/infra/db/stats").then((res) => res.data);
}
