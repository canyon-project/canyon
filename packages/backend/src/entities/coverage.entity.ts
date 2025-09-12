import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'canyonjs_coverage' })
export class CoverageEntity {
  @PrimaryKey({ type: 'text' })
  id!: string;

  @Index()
  @Property({ fieldName: 'provider', type: 'text' })
  provider!: string;

  @Index({ name: 'repo_id_idx' })
  @Property({ fieldName: 'repo_id', type: 'text' })
  repoID!: string;

  @Index()
  @Property({ fieldName: 'sha', type: 'text' })
  sha!: string;

  @Property({ fieldName: 'build_provider', type: 'text' })
  buildProvider!: string;

  @Property({ fieldName: 'build_id', type: 'text' })
  buildID!: string;

  @Property({ fieldName: 'instrument_cwd', type: 'text' })
  instrumentCwd!: string;

  @Property({ fieldName: 'report_provider', type: 'text' })
  reportProvider!: string;

  @Property({ fieldName: 'report_id', type: 'text' })
  reportID!: string;

  @Property({ fieldName: 'version_id', type: 'text' })
  versionID!: string;

  @Property({ fieldName: 'compare_target', type: 'text' })
  compareTarget!: string;

  @Property({ fieldName: 'created_at' })
  createdAt!: Date;

  @Property({ fieldName: 'updated_at' })
  updatedAt!: Date;
}
