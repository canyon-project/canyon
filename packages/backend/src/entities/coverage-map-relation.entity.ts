import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core'

@Entity({ tableName: 'canyonjs_coverage_map_relation' })
export class CoverageMapRelationEntity {
  @PrimaryKey({ type: 'text' })
  id!: string

  @Index()
  @Property({ fieldName: 'coverage_id', type: 'text' })
  coverageId!: string

  @Index()
  @Property({ fieldName: 'coverage_map_hash_id', type: 'text' })
  coverageMapHashId!: string

  @Property({ fieldName: 'full_file_path', type: 'text' })
  fullFilePath!: string

  @Property({ fieldName: 'file_path', type: 'text', nullable: true })
  filePath?: string | null
}
