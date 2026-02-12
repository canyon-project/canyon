import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSnapshotDto {
  @IsString()
  repoID!: string;

  @IsString()
  provider!: string;

  /** Commit SHA (40 位) 或 accumulative 的 base...head，与 subjectID 二选一 */
  @IsString()
  @IsOptional()
  @MinLength(7)
  @MaxLength(200)
  sha?: string;

  /** 与 sha 二选一 */
  @IsString()
  @IsOptional()
  @MinLength(7)
  @MaxLength(200)
  subjectID?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
