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

  @Property({ fieldName: 'build_provider', type: 'text', nullable: true })
  buildProvider?: string | null;

  @Property({ fieldName: 'build_id', type: 'text', nullable: true })
  buildID?: string | null;

  @Property({ fieldName: 'instrument_cwd', type: 'text', nullable: true })
  instrumentCwd?: string | null;

  @Property({ fieldName: 'report_provider', type: 'text', nullable: true })
  reportProvider?: string | null;

  @Property({ fieldName: 'report_id', type: 'text', nullable: true })
  reportID?: string | null;
}
