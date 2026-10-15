/** 与 CI 文档一致的 e2e tag */
export const TAG_E2E_PIPELINE = {
  source: "automation",
  type: "e2e",
  env: "test",
  trigger: "pipeline",
} as const;
