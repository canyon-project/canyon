import { IsOptional, IsString } from 'class-validator';
import { MapQueryDto } from './map.dto';

export class SummaryMapQueryDto extends MapQueryDto {
  @IsString()
  @IsOptional()
  buildProvider?: string;

  @IsString()
  @IsOptional()
  buildID?: string;
}
