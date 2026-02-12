import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateSnapshotDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['pending', 'running', 'done', 'failed'])
  status?: string;
}
