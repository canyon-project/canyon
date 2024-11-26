import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  Validate,
} from 'class-validator';
import { IsValidCoverage } from '../valids/is-valid-coverage-map';

export class CoverageMapClientDto {
  // git仓库相关
  @IsString()
  @Matches(/^[a-f0-9]{40}$/i, { message: 'sha格式不正确' })
  @IsNotEmpty({ message: 'sha 不能为空' })
  sha: string;

  @IsString()
  @MinLength(1, { message: 'branch长度最小为1' })
  @IsOptional({ message: 'branch 可以为空' })
  branch: string;

  // @IsString()
  // @MinLength(1, { message: "buildID长度最小为1" })
  // @IsOptional({ message: "buildID 可以为空" })
  // buildID: string;

  // @IsString()
  // @MinLength(1, { message: "buildProvider长度最小为1" })
  // @IsOptional({ message: "buildProvider 可以为空" })
  // buildProvider: string;

  // // 允许为空，但是最小长度为1
  // @IsString()
  // @MinLength(1, { message: "compareTarget长度最小为1" })
  // @IsOptional({ message: "compareTarget可以为空" })
  // compareTarget: string;

  // // 允许为空
  // @IsString()
  // @IsOptional({ message: "key可以为空" })
  // key: string;

  @IsString()
  @IsNotEmpty({ message: 'projectID 不能为空' })
  projectID: string;

  // // 单次 case 触发相关
  // @IsString()
  // @MinLength(1, { message: "reportID长度最小为1" })
  // @IsOptional({ message: "reportID 可以为空" })
  // reportID: string;

  // istanbul覆盖率相关
  @IsString()
  @MinLength(1, { message: 'reportID长度最小为1' })
  @IsNotEmpty({ message: 'instrumentCwd不能为空' })
  instrumentCwd: string;

  @IsNotEmpty({ message: 'coverage不能为空' })
  @Validate(IsValidCoverage)
  coverage: any;

  // @IsString()
  // @IsNotEmpty({ message: "timing不能为空" })
  // timing: string;

  // @IsOptional({ message: "tags 可以为空" })
  // tags: any;
  //
  // createdAt: Date;
  // updatedAt: Date;
  // userAgent: string;
  // ip: string;
}
