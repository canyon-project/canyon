import { IsOptional, IsString } from 'class-validator';

export class QuerySnapshotDto {
  @IsString()
  repoID!: string;

  @IsString()
  provider!: string;
}
