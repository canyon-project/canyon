import { Column, Entity } from 'typeorm'
import { CommonBaseEntity } from '../../../common/base/common-base.entity'

@Entity('user')
export class User extends CommonBaseEntity {
  @Column({
    type: 'varchar',
    default: '',
    comment: '用户名',
    name: 'username',
  })
  username: string

  @Column({
    type: 'varchar',
    default: '',
    comment: '昵称',
  })
  nickname: string

  @Column({
    type: 'varchar',
    default: '',
    comment: '头像',
  })
  avatar: string

  @Column({
    type: 'varchar',
    default: '',
    comment: '邮箱',
  })
  email: string

  @Column({
    type: 'varchar',
    default: '',
    comment: '密码',
  })
  password: string

  @Column({
    type: 'int',
    default: 0,
    comment: '第三方id',
    name: 'th_id',
  })
  thId: number

  @Column({
    type: 'varchar',
    default: '',
    comment: '第三方access_token',
    name: 'th_access_token',
  })
  thAccessToken: string

  @Column({
    type: 'varchar',
    default: '',
    comment: '第三方refresh_token',
    name: 'th_refresh_token',
  })
  thRefreshToken: string

  @Column({
    type: 'varchar',
    default: '',
    comment: 'role',
  })
  role: string

  @Column({
    type: 'int',
    default: 0,
    comment: 'active',
  })
  active: number
}
