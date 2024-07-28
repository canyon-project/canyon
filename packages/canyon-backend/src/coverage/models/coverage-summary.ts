import { Field, ObjectType } from "@nestjs/graphql";
import { Statistics2 } from "./common.model";

@ObjectType()
export class CoverageSummary {
  @Field(() => String)
  path: string;
  @Field(() => Statistics2)
  statements: Statistics2;
  @Field(() => Statistics2)
  lines: Statistics2;
  @Field(() => Statistics2)
  newlines: Statistics2;
  @Field(() => Statistics2)
  functions: Statistics2;
  @Field(() => Statistics2)
  branches: Statistics2;
}
