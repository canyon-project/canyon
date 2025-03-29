import { Field, ObjectType } from '@nestjs/graphql';
import { CoverageRecordsModel } from '../coverage-records.model';

@ObjectType()
export class GetCoveragesResponseModel {
  @Field(() => [CoverageRecordsModel])
  data: CoverageRecordsModel[];

  @Field(() => Number)
  total: number;
}
