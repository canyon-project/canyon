import { Args, Query, Resolver } from '@nestjs/graphql';
import { GetCoveragesService } from './services/get-coverages.service';
import { GetCoveragesResponseModel } from './models/response/get-coverages.response.model';
import { GetCoveragesRequestModel } from './models/request/get-coverages.request.model';

@Resolver(() => 'Coverage')
export class CoverageResolver {
  constructor(private readonly getCoveragesService: GetCoveragesService) {}

  @Query(() => GetCoveragesResponseModel, {
    description: '获取Coverage列表',
  })
  getCoverages(
    @Args() args: GetCoveragesRequestModel,
  ): Promise<GetCoveragesResponseModel> {
    return this.getCoveragesService.invoke(args.current, args.pageSize);
  }
}
