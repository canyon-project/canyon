import { Entity, Column } from 'typeorm'
import { CommonBaseEntity } from '../../../common/base/common-base.entity'

const { coverageEntityTableName } = global.conf.datasource.mysql

@Entity(coverageEntityTableName)
export class Coverage extends CommonBaseEntity {
  @Column({
    name: 'commit_sha',
    type: 'varchar',
    default: '',
    comment: 'commitSha',
  })
  commitSha: string

  @Column({
    name: 'repo_id',
    type: 'int',
    default: 0,
    comment: '仓库id',
  })
  repoId: number

  @Column({
    name: 'instrument_cwd',
    type: 'varchar',
    default: '',
    comment: '插桩路径',
  })
  instrumentCwd: string

  @Column({
    type: 'int',
    default: 0,
    comment: '上报人',
  })
  reporter: number

  @Column({
    name: 'relation_id',
    type: 'varchar',
    comment: '关系id',
  })
  relationId: string

  @Column({
    name: 'report_id',
    type: 'varchar',
    default: '',
    comment: '报告id',
  })
  reportId: string

  //agg、normal
  @Column({
    name: 'cov_type',
    type: 'varchar',
    default: 'normal',
    comment: '类型',
  })
  covType: string

  @Column({
    name: 'cov_agg_status',
    type: 'varchar',
    default: 'complete',
    comment: '覆盖率聚合状态',
  })
  covAggStatus: string

  // 需要有一个触发表，commit reportId relationId
}
