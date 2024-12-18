import { Field, ObjectType } from "@nestjs/graphql";
import { ProjectRecordsModel } from "./project-records.model";

@ObjectType()
export class ProjectRecordsPagesModel {
  @Field(() => [ProjectRecordsModel])
  data: ProjectRecordsModel[];

  @Field(() => Number)
  total: number;
}
