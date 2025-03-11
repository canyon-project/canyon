import {ArgsType, Field, Int} from "@nestjs/graphql";

@ArgsType()
export class GetProjectsRequestModel {
  @Field(() => Int, {
    description: "当前页码",
  })
  current: number;

  @Field(() => Int, {
    description: "每页数量",
  })
  pageSize: number;
}
