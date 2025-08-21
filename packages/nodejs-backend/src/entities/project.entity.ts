import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'projects' })
export class ProjectEntity {
  @PrimaryKey()
  id!: string;

  @Property({ length: 256 })
  name!: string;

  @Property({ nullable: true, length: 1024 })
  description?: string | null;

  @Property({ type: 'timestamp', onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ type: 'timestamp', onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date | null;
}


