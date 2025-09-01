import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SummaryMapQueryDto {
  @IsString()
  @IsNotEmpty()
  subject!: string; // commit|commits|pull|pulls

  @IsString()
  @IsNotEmpty()
  subjectID!: string; // sha or pullNumber

  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsString()
  @IsNotEmpty()
  repoID!: string;

  @IsString()
  @IsOptional()
  buildProvider?: string;

  @IsString()
  @IsOptional()
  buildID?: string;

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
}
