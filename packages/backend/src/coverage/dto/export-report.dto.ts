import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ExportFormat {
  HTML = 'html',
  JSON = 'json',
  LCOV = 'lcov',
  COBERTURA = 'cobertura',
}

export class ExportReportDto {
  @IsString()
  provider: string;

  @IsString()
  repoID: string;

  @IsString()
  sha: string;

  @IsOptional()
  @IsString()
  buildTarget?: string;

  @IsOptional()
  @IsString()
  reportProvider?: string;

  @IsOptional()
  @IsString()
  reportID?: string;

  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat = ExportFormat.HTML;
}
