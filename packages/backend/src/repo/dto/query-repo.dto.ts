import { IsOptional, IsString } from 'class-validator';

export class QueryRepoDto {
  @IsString()
  @IsOptional()
  bu?: string;

  @IsString()
  @IsOptional()
  search?: string; // 用于搜索 repoID 和 pathWithNamespace
}
