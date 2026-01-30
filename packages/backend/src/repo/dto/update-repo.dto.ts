import { IsOptional, IsString } from 'class-validator';

export class UpdateRepoDto {
  @IsString()
  @IsOptional()
  pathWithNamespace?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  bu?: string;

  @IsString()
  @IsOptional()
  tags?: string; // JSON string

  @IsString()
  @IsOptional()
  members?: string; // JSON string

  @IsString()
  @IsOptional()
  config?: string;

  @IsString()
  @IsOptional()
  provider?: string;
}
