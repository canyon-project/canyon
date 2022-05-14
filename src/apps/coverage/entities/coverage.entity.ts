import { Entity, Column } from 'typeorm'
import { CommonBaseEntity } from '../../../common/base/common-base.entity'

@Entity('coverage')
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
}
