import { ArgsType, Field, ID, InputType, Int } from "@nestjs/graphql";

@ArgsType()
@InputType()
export class PaginationArgs {
  @Field(() => Int, {
    description: "当前页码",
  })
  current: number;

  @Field(() => Int, {
    description: "每页数量",
  })
  pageSize: number;
}

@ArgsType()
@InputType()
export class SorterArgs {
  @Field({
    description: "排序字段名称",
  })
  field: string;

  @Field({
    description: "升序或降序",
  })
  order: string;
}
