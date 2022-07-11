import { Column, Entity } from 'typeorm'
import { CommonBaseEntity } from '../../../common/base/common-base.entity'

const { repoEntityTableName } = global.conf.datasource.mysql

@Entity(repoEntityTableName)
export class Repo extends CommonBaseEntity {
  @Column({
    name: 'th_repo_id',
    type: 'varchar',
    default: '',
    comment: 'git项目的id',
  })
  thRepoId: string
}
