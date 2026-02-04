import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BaseMapQueryDto {
  @IsString()
  @IsNotEmpty()
  subject!: 'commit' | 'accumulative' | 'pull' | 'merge_requests';

  @IsString()
  @IsNotEmpty()
  subjectID!: string; // sha or afterCommitSHA...nowCommitSHA

  @IsString()
  @IsNotEmpty()
  provider!: 'gitlab' | 'github';

  @IsString()
  @IsNotEmpty()
  repoID!: string;

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
  mode?: 'blockMerge' | 'fileMerge' | 'default';

  @IsString()
  @IsOptional()
  onlyChanged?: string; // 'true' | 'false'，是否仅返回变更文件，默认为 false，只有显式设置为 'true' 时才生效

  scene: string;
}
