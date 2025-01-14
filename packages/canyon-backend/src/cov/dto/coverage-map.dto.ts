import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class CoverageMapDto {
  // git仓库相关
  @IsString()
  @Matches(/^[a-f0-9]{40}$/i, { message: "sha格式不正确" })
  @IsNotEmpty({ message: "sha 不能为空" })
  sha: string;

  @IsString()
  @IsNotEmpty({ message: "projectID 不能为空" })
  projectID: string;

  // 单次 case 触发相关
  @IsString()
  @MinLength(1, { message: "reportID长度最小为1" })
  @IsOptional({ message: "reportID 可以为空" })
  reportID: string;

  @IsString()
  @MinLength(1, { message: "filepath长度最小为1" })
  @IsOptional({ message: "filepath 可以为空" })
  filepath: string;
}
