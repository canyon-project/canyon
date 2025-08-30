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
  @IsNotEmpty()
  buildProvider!: string;

  @IsString()
  @IsNotEmpty()
  buildID!: string;

  @IsString()
  @IsOptional()
  reportProvider?: string;

  @IsString()
  @IsOptional()
  reportID?: string;

  @IsString()
  @IsOptional()
  filePath?: string;
}
