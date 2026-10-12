import type { Kysely } from "kysely";

import type { Database, Json } from "../db/types.js";
import { coverageMapRowId } from "../lib/coverage-map-id.js";
import type { IstanbulFileCoverage } from "../lib/istanbul-coverage.js";
import { inputSourceMapHash } from "../lib/stable-hash.js";

export type InitCoverageMapResult = {
  buildHash: string;
  fileCount: number;
};

export async function initCoverageMap(
  db: Kysely<Database>,
  meta: Omit<IstanbulFileCoverage, "path" | "statementMap" | "inputSourceMap">,
  files: IstanbulFileCoverage[],
): Promise<InitCoverageMapResult> {
  const now = new Date();
  const buildHash = meta.buildHash;

  await db.transaction().execute(async (trx) => {
    await trx
      .insertInto("canyon_next6_coverage")
      .values({
        id: buildHash,
        provider: meta.provider ?? "",
        repo_id: meta.repoID ?? "",
        sha: meta.sha ?? "",
        build_target: meta.buildTarget ?? "",
        instrument_cwd: meta.instrumentCwd ?? "",
        created_at: now,
        updated_at: now,
      })
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();

    for (const file of files) {
      const rawFilePath = file.path;
      const id = coverageMapRowId(buildHash, rawFilePath);

      let sourceMapHash: string | null = null;
      if (file.inputSourceMap != null) {
        sourceMapHash = inputSourceMapHash(file.inputSourceMap);
        await trx
          .insertInto("canyon_next6_input_source_map")
          .values({
            hash: sourceMapHash,
            source_map: file.inputSourceMap as Json,
            created_at: now,
          })
          .onConflict((oc) => oc.column("hash").doNothing())
          .execute();
      }

      await trx
        .insertInto("canyon_next6_coverage_map")
        .values({
          id,
          build_hash: buildHash,
          raw_file_path: rawFilePath,
          statement_map: file.statementMap as Json,
          input_source_map_hash: sourceMapHash,
          created_at: now,
        })
        .onConflict((oc) => oc.columns(["build_hash", "raw_file_path"]).doNothing())
        .execute();
    }
  });

  return { buildHash, fileCount: files.length };
}
