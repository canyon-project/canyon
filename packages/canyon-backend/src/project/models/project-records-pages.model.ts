import { Field, ID, ObjectType, Resolver } from '@nestjs/graphql';
// import { Project } from '../project.model';
import { ProjectRecordsModel } from './project-records.model';

@ObjectType()
export class ProjectRecordsPagesModel {
  @Field(() => [ProjectRecordsModel])
  data: ProjectRecordsModel[];

  @Field(() => Number)
  total: number;
}
