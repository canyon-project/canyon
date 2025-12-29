import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  Validate,
} from 'class-validator';
import { IsValidCoverage } from '../valids/is-valid-coverage';

export class CoverageMapInitDto {
  // buildHash五要素
  @IsString()
  @Matches(/^[a-f0-9]{40}$/i, { message: 'sha格式不正确' })
  @IsNotEmpty({ message: 'sha 不能为空' })
  sha: string;

  @IsString()
  @IsNotEmpty({ message: 'provider 不能为空' })
  provider: string;

  @IsString()
  @IsNotEmpty({ message: 'repoID 不能为空' })
  repoID: string;

  // istanbul覆盖率相关
  @IsString()
  @MinLength(1, { message: 'instrumentCwd长度最小为1' })
  @IsNotEmpty({ message: 'instrumentCwd不能为空' })
  instrumentCwd: string;

  @IsString()
  @MinLength(1, { message: 'buildTarget长度最小为1' })
  @IsOptional({ message: 'buildTarget 可以为空' })
  buildTarget: string;

  // build 信息，包含流水线信息，key-value 形式
  @IsOptional({
    message: 'build 可以为空',
  })
  @IsObject({ message: 'build 必须是一个对象' })
  build: Record<string, any>;

  @IsNotEmpty({ message: 'coverage不能为空' })
  @Validate(IsValidCoverage)
  coverage: any;
}
