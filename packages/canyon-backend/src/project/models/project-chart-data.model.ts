import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProjectChartDataModel {
  @Field(() => Number, {
    description: '整体覆盖率',
  })
  statements: number;
  @Field(() => Number, {
    description: 'New Lines',
  })
  newlines: number;
  @Field(() => String, {
    description: 'sha',
  })
  sha: string;
}
