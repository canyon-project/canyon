import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

class Scope {
  @Property()
  buildTarget!: string;
  @Property()
  includes!: string[];
  @Property()
  excludes!: string[];
}

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

  @Property()
  bu!: string;

  @Property()
  scopes!: Scope[];

  @Property({ fieldName: 'created_at' })
  createdAt!: Date;

  @Property({ fieldName: 'updated_at' })
  updatedAt!: Date;
}
