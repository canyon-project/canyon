import { IsOptional, IsString } from 'class-validator';
import { BaseMapQueryDto } from './base-map-query.dto';

export class MapQueryDto extends BaseMapQueryDto {
  @IsString()
  @IsOptional()
  buildTarget?: string;
}
