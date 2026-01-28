import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRepoDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  pathWithNamespace!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

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
  @IsNotEmpty()
  config!: string;
}
