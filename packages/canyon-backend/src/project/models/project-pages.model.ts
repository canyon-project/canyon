import { Field, ID, ObjectType, Resolver } from "@nestjs/graphql";
import { BuOption, Project } from "../project.model";

@ObjectType()
export class ProjectPagesModel {
  @Field(() => [Project])
  data: Project[];

  @Field(() => Number)
  total: number;

  // @Field(() => [BuOption])
  // buOptions: BuOption[];
}
