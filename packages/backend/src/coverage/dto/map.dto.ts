import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MapQueryDto {
  @IsString()
  @IsNotEmpty()
  subject!: string; // commit|commits|analysis|analyses|multiple-commits

  @IsString()
  @IsNotEmpty()
  subjectID!: string; // sha or analysisNumber or commit1...commit2

  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsString()
  @IsNotEmpty()
  repoID!: string;

  @IsString()
  @IsOptional()
  buildTarget?: string;

  @IsString()
  @IsOptional()
  reportProvider?: string;

  @IsString()
  @IsOptional()
  reportID?: string;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsString()
  @IsOptional()
  mode?: string; // blockMerge | fileMerge | default

  @IsString()
  @IsOptional()
  compareTarget?: string; // 用于与当前 commit 对比的目标 ref/sha（仅 gitlab 支持）

  @IsString()
  @IsOptional()
  onlyChanged?: string; // 'true' | 'false'，是否仅返回变更文件
}
