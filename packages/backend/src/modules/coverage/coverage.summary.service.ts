import type { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
// axios not used
import { CoverageEntity } from '../../entities/coverage.entity';
import { CoverageMapRelationEntity } from '../../entities/coverage-map-relation.entity';
import { percent } from '../../helpers/utils';
import type { ChService } from '../ch/ch.service';
import type { SystemConfigService } from '../system-config/system-config.service';
import type { CoverageGitService } from './coverage.git.service';
import type { CoverageMapStoreService } from './coverage.map-store.service';
import { trimInstrumentCwd, tupleToMap } from './coverage.utils';

@Injectable()
export class CoverageSummaryService {
  constructor(
    private readonly ch: ChService,
    private readonly mapStore: CoverageMapStoreService,
    // keep for future use but not as private members to avoid lints
    _syscfg: SystemConfigService,
    _git: CoverageGitService,
    @InjectRepository(CoverageEntity)
    private readonly covRepo: EntityRepository<CoverageEntity>,
    @InjectRepository(CoverageMapRelationEntity)
    private readonly relRepo: EntityRepository<CoverageMapRelationEntity>,
  ) {}

  async getSummaryMap(q: {
    subject: string;
    subjectID: string;
    provider: string;
    repoID: string;
    buildProvider?: string;
    buildID?: string;
  }) {
    const { subject, subjectID, provider, repoID, buildProvider, buildID } =
      q ?? {};
    if (!provider || !repoID || !subject || !subjectID) {
      throw new BadRequestException(
        'provider, repoID, subject, subjectID are required',
      );
    }
    if (!buildProvider || !buildID) {
      throw new BadRequestException('buildProvider, buildID are required');
    }

    if (subject === 'commit' || subject === 'commits') {
      const qb: {
        provider: string;
        repoID: string;
        sha: string;
        buildProvider?: string;
        buildID?: string;
      } = { provider, repoID, sha: subjectID };
      if (buildProvider) qb.buildProvider = buildProvider;
      if (buildID) qb.buildID = buildID;
      const coverages = await this.covRepo.find(qb, {
        fields: ['id', 'instrumentCwd'],
      });
      if (!coverages.length) return {};
      const coverageIDs = coverages.map((c) => c.id);
      const idsList = coverageIDs
        .map((id) => `'${id.replace(/'/g, "''")}'`)
        .join(',');
      const hitQuery = `
        SELECT
          full_file_path as fullFilePath,
          sumMapMerge(s) as s,
          sumMapMerge(f) as f,
          sumMapMerge(b) as b
        FROM coverage_hit_agg
        WHERE coverage_id IN (${idsList})
        GROUP BY full_file_path
      `;
      const ch = this.ch.getClient();
      const hitRes = await ch.query({ query: hitQuery, format: 'JSONEachRow' });
      const rows: Array<{
        fullFilePath: string;
        s: unknown;
        f: unknown;
        b: unknown;
      }> = await hitRes.json();

      const instrumentCwd =
        (coverages[0]?.instrumentCwd as string | null | undefined) || '';
      const relWhere: { coverageID: { $in: string[] }; filePath?: RegExp } = {
        coverageID: { $in: coverageIDs },
      };
      relWhere.filePath = /^(?!dist).*/;
      const relationsAll = await this.relRepo.find(relWhere, {
        fields: ['coverageMapHashID', 'fullFilePath'],
      });
      const pathToHash = new Map<string, string>();
      for (const r of relationsAll) {
        if (!pathToHash.has(r.fullFilePath))
          pathToHash.set(r.fullFilePath, r.coverageMapHashID);
      }
      const allHashes = Array.from(new Set(Array.from(pathToHash.values())));
      const hashToMap =
        await this.mapStore.fetchCoverageMapsFromClickHouse(allHashes);

      const result: Record<
        string,
        {
          path: string;
          statements: { total: number; covered: number; pct: number };
          functions: { total: number; covered: number; pct: number };
          branches: { total: number; covered: number; pct: number };
          newlines: { total: number; covered: number; pct: number };
        }
      > = {};
      for (const r of rows || []) {
        const rel = trimInstrumentCwd(r.fullFilePath, instrumentCwd);
        const hash = pathToHash.get(r.fullFilePath);
        if (hash) {
          const structure = hash ? hashToMap.get(hash) : undefined;
          const sMap = tupleToMap(r.s);
          const fMap = tupleToMap(r.f);
          const bMap = tupleToMap(r.b);

          const totalStatements = structure
            ? Object.keys(structure.statementMap || {}).length
            : Object.keys(sMap).length;
          const coveredStatements = Object.values(sMap).reduce(
            (a: number, v: unknown) => a + (Number(v) > 0 ? 1 : 0),
            0,
          );
          const totalFunctions = structure
            ? Object.keys(structure.fnMap || {}).length
            : Object.keys(fMap).length;
          const coveredFunctions = Object.values(fMap).reduce(
            (a: number, v: unknown) => a + (Number(v) > 0 ? 1 : 0),
            0,
          );
          const totalBranches: number = structure
            ? (
                Object.values(structure.branchMap || {}) as Array<{
                  locations?: unknown[];
                }>
              ).reduce(
                (a: number, v) =>
                  a + (Array.isArray(v.locations) ? v.locations.length : 0),
                0,
              )
            : Object.keys(bMap).length;
          const coveredBranches: number = Object.values(bMap).reduce(
            (a: number, v: unknown) => a + (Number(v) > 0 ? 1 : 0),
            0,
          );

          result[rel] = {
            path: rel,
            statements: {
              total: totalStatements,
              covered: coveredStatements,
              pct: percent(Number(coveredStatements), Number(totalStatements)),
            },
            functions: {
              total: totalFunctions,
              covered: coveredFunctions,
              pct: percent(Number(coveredFunctions), Number(totalFunctions)),
            },
            branches: {
              total: totalBranches,
              covered: coveredBranches,
              pct: percent(Number(coveredBranches), Number(totalBranches)),
            },
            newlines: { total: 0, covered: 0, pct: 0 },
          };
        }
      }
      return result;
    }
    throw new BadRequestException('invalid subject');
  }
}
