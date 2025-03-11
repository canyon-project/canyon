import { Field, ObjectType } from "@nestjs/graphql";
import {ProjectRecordsModel} from "../project-records.model";
// import { ProjectRecordsModel } from "./project-records.model";

@ObjectType()
export class GetProjectsResponseModel {
  @Field(() => [ProjectRecordsModel])
  data: ProjectRecordsModel[];

  @Field(() => Number)
  total: number;
}
