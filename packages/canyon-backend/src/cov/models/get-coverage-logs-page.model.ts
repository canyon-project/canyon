import { Field, ObjectType } from "@nestjs/graphql";
import { GetCoverageLogsResponseModel } from "./get-coverage-logs-response.model";

@ObjectType()
export class GetCoverageLogsPageModel {
    @Field(() => [GetCoverageLogsResponseModel])
    data: GetCoverageLogsResponseModel[];

    @Field(() => Number)
    total: number;
}
