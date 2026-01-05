import { IsNotEmpty, IsString } from 'class-validator';

export class CommitsQueryDto {
  @IsString()
  @IsNotEmpty()
  repoID!: string;
}
