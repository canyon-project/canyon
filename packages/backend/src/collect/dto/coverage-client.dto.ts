import { IsNotEmpty, IsObject, IsOptional, Validate } from 'class-validator';
import { IsValidCoverage } from '../valids/is-valid-coverage';

export class CoverageClientDto {
  @IsNotEmpty({ message: 'coverage不能为空' })
  @Validate(IsValidCoverage)
  coverage: any;

  // scene 信息，key-value 形式的对象
  @IsObject({ message: 'scene 必须是一个对象' })
  @IsOptional({
    message: 'scene 可以为空',
  })
  scene: Record<string, any>;
}
