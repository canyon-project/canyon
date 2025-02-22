import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ProjectRecordsModel {
  @Field(() => String, {
    description: "Description",
  })
  description: string;

  @Field(() => String, {
    description: "ID",
  })
  id: string;
}
