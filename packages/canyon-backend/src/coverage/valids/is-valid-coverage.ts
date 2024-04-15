import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
function isValidCoverage(coverage) {
  // 检查是否是对象
  if (typeof coverage !== 'object' || coverage === null) {
    return false;
  }
  // 检查是否有必须的属性
  const requiredProperties = [
    'path',
    'statementMap',
    'fnMap',
    'branchMap',
    's',
    'f',
    'b',
  ];
  for (const prop of requiredProperties) {
    if (!(prop in coverage)) {
      return false;
    }
  }
  // 检查属性的类型和结构
  if (
    typeof coverage.path !== 'string' ||
    typeof coverage.statementMap !== 'object' ||
    typeof coverage.fnMap !== 'object' ||
    typeof coverage.branchMap !== 'object' ||
    typeof coverage.s !== 'object' ||
    typeof coverage.f !== 'object' ||
    typeof coverage.b !== 'object'
  ) {
    return false;
  }

  // 如果所有检查通过，返回 true
  return true;
}
@ValidatorConstraint({ name: 'isValidCoverage', async: false })
export class IsValidCoverage implements ValidatorConstraintInterface {
  validate(coverage: unknown) {
    if (Object.keys(coverage).length === 0) {
      return false;
    }
    return Object.values(coverage).every((item) => {
      return isValidCoverage(item);
    });
  }

  defaultMessage() {
    return 'coverage格式不正确';
  }
}
