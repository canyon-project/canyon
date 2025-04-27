import { IsString, IsOptional } from 'class-validator';


export class CoverageQueryDto {
  @IsString()
  provider: string;

  @IsString()
  repoID: string;

  @IsString()
  sha: string;


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
}
