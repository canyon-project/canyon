import { randomUUID } from "node:crypto";

import type { Kysely } from "kysely";

import type { Database, Json } from "../db/types.js";
import type { ParsedCoverageClient } from "../lib/coverage-client-parse.js";
import { CoverageMapInitError } from "../lib/istanbul-coverage.js";
import { tagKey } from "../lib/tag.js";

export type IngestCoverageClientResult = {
  buildHash: string;
  tagKey: string;
  hitCount: number;
};

/** 写入 tag + 直接 insert hit 行（不做合并） */
export async function ingestCoverageClient(
  db: Kysely<Database>,
  parsed: ParsedCoverageClient,
): Promise<IngestCoverageClientResult> {
  const { tag, buildHash, files } = parsed;
  const key = tagKey(tag);
  const now = new Date();

  const coverage = await db
    .selectFrom("canyon_next6_coverage")
    .select("id")
    .where("id", "=", buildHash)
    .executeTakeFirst();

  if (!coverage) {
    throw new CoverageMapInitError(
      400,
      `buildHash 不存在，请先调用 /coverage/map/init: ${buildHash}`,
    );
  }

  await db.transaction().execute(async (trx) => {
    await trx
      .insertInto("canyon_next6_tag")
      .values({
        id: key,
        tag: tag as unknown as Json,
        created_at: now,
        updated_at: now,
      })
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();

    for (const file of files) {
      await trx
        .insertInto("canyon_next6_coverage_hit")
        .values({
          id: randomUUID(),
          build_hash: buildHash,
          tag_key: key,
          raw_file_path: file.path,
          s: file.s as unknown as Json,
          created_at: now,
        })
        .execute();
    }
  });

  return { buildHash, tagKey: key, hitCount: files.length };
}
