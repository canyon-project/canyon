export type CanyonGlobal = typeof globalThis & {
  CANYON_DSN?: string;
  CANYON_SCENE?: Record<string, unknown>;
  __coverage__?: Record<string, unknown>;
};

export function getGlobal(): CanyonGlobal {
  return new Function("return this")() as CanyonGlobal;
}
