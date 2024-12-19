import {
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MinLength,
    Validate,
} from "class-validator";
import { IsValidCoverage } from "../valids/is-valid-coverage";

export class CoverageClientDto {
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

    // istanbul覆盖率相关
    @IsString()
    @MinLength(1, { message: "instrumentCwd长度最小为1" })
    @IsNotEmpty({ message: "instrumentCwd不能为空" })
    instrumentCwd: string;

    // @IsNotEmpty({ message: 'coverage不能为空' })
    @Validate(IsValidCoverage)
    coverage: any;

    @IsString()
    @MinLength(1, { message: "branch长度最小为1" })
    @IsOptional({ message: "branch 可以为空" })
    branch: string;
}
