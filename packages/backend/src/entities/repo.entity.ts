import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'canyonjs_repo' })
export class RepoEntity {
  @PrimaryKey()
  id!: string;

  @Property({
    fieldName: 'path_with_namespace',
  })
  pathWithNamespace!: string;

  @Property()
  description!: string;

  @Property({ fieldName: 'created_at' })
  createdAt!: Date;

  @Property({ fieldName: 'updated_at' })
  updatedAt!: Date;
}
