import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'canyonjs_config' })
export class ConfigEntity {
  @PrimaryKey()
  id!: string;

  @Property()
  key!: string;

  @Property()
  value!: string;

  @Property({ fieldName: 'created_at' })
  createdAt!: Date;

  @Property({ fieldName: 'updated_at' })
  updatedAt!: Date;
}
