import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'canyonjs_coverage_map_relation' })
export class CoverageMapRelationEntity {
  @PrimaryKey({ type: 'text' })
  id!: string;

  @Index()
  @Property({ fieldName: 'coverage_id', type: 'text' })
  coverageID!: string;

  @Index()
  @Property({ fieldName: 'coverage_map_hash_id', type: 'text' })
  coverageMapHashID!: string;

  @Property({ fieldName: 'full_file_path', type: 'text' })
  fullFilePath!: string;

  @Property({ fieldName: 'file_path', type: 'text', nullable: true })
  filePath?: string | null;
}
