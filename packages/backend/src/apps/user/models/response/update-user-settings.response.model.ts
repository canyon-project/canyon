import { Field, ObjectType } from "@nestjs/graphql";
// import {ProjectRecordsModel} from "../project-records.model";
// import { ProjectRecordsModel } from "./project-records.model";

@ObjectType()
export class UpdateUserSettingsResponseModel {
  @Field(() => String)
  theme: string;
  @Field(() => String)
  language: string;
}
