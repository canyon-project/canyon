import { IsNotEmpty, Validate } from 'class-validator';
import { IsValidCoverage } from '../valids/is-valid-coverage';

export class CoverageClientDto {
  @IsNotEmpty({ message: 'coverage不能为空' })
  @Validate(IsValidCoverage)
  coverage: any;
}
