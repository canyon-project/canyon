import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ProjectCompartmentDataModel {
  @Field(() => String, {
    description: "label",
  })
  label: string;

  @Field(() => String, {
    description: "value",
  })
  value: string;
}
