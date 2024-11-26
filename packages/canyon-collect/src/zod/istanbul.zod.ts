import { z } from 'zod';

const Range = z.object({
  start: z.object({ line: z.number(), column: z.number() }),
  end: z.object({ line: z.number(), column: z.number() }),
});

const IstanbulHitSchema = z.object({
  s: z.unknown(),
  f: z.unknown(),
  b: z.unknown(),
});

// map类型的key是文件路径，value是IstanbulDataSchema
export const IstanbulHitMapSchema = z.record(IstanbulHitSchema);

export type IstanbulHitMapType = z.infer<typeof IstanbulHitMapSchema>;

const IstanbulMapSchema = z.object({
  statementMap: z.unknown(),
  fnMap: z.unknown(),
  branchMap: z.unknown(),
  inputSourceMap: z.unknown(),
});

// map类型的key是文件路径，value是IstanbulDataSchema
export const IstanbulMapMapSchema = z.record(IstanbulMapSchema);

export type IstanbulMapMapType = z.infer<typeof IstanbulMapMapSchema>;
