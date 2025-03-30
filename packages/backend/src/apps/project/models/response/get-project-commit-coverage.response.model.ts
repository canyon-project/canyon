import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CaseModel {
  @Field(() => String)
  reportID: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  status: string;

  @Field(() => Number)
  successCount: number;

  @Field(() => Number)
  failureCount: number;

  @Field(() => String)
  reportProvider: string;

  @Field(() => String)
  type: string;
}

@ObjectType()
export class ReportModel {
  @Field(() => String)
  reportID: string;

  @Field(() => String)
  type: string;

  @Field(() => Number)
  coveragePercentage: number;

  @Field(() => [CaseModel])
  cases: CaseModel[];
}

@ObjectType()
export class CoverageMetricsModel {
  @Field(() => Number)
  e2eCoverage: number;

  @Field(() => Number)
  unitTestCoverage: number;
}

@ObjectType()
export class GetProjectCommitCoverageResponseModel {
  @Field(() => String)
  buildID: string;

  @Field(() => CoverageMetricsModel)
  coverage: CoverageMetricsModel;

  @Field(() => [ReportModel])
  reports: ReportModel[];
}
