declare module "@babel/core" {
  export interface TransformResult {
    code?: string | null;
    map?: unknown;
  }

  export function transformAsync(
    code: string,
    options?: Record<string, unknown>,
  ): Promise<TransformResult | null>;
}
