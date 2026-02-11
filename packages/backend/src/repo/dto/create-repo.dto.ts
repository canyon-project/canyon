import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateRepoDto {
  @IsString()
  @IsNotEmpty()
  repoID!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['github', 'gitlab'])
  provider!: 'github' | 'gitlab';
}
