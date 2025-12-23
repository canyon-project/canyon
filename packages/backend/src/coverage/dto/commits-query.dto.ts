import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CommitsQueryDto {
  @IsString()
  @IsNotEmpty()
  repoID!: string;

  @IsString()
  @IsOptional()
  search?: string; // 搜索 sha、分支、对比目标

  @IsString()
  @IsOptional()
  defaultBranch?: string; // 默认分支，用于筛选

  @IsString()
  @IsOptional()
  page?: string; // 页码

  @IsString()
  @IsOptional()
  pageSize?: string; // 每页数量
}
