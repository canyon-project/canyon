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
    // "path",
    // "statementMap",
    // "fnMap",
    // "branchMap",
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
    // typeof coverage.path !== "string" ||
    // typeof coverage.statementMap !== "object" ||
    // typeof coverage.fnMap !== "object" ||
    // typeof coverage.branchMap !== "object" ||
    typeof coverage.s !== 'object' ||
    typeof coverage.f !== 'object' ||
    typeof coverage.b !== 'object'
  ) {
    return false;
  }

  // 如果所有检查通过，返回 true
  return true;
}
// 安全转JSON
function safeParseJSON(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return {};
  }
}
@ValidatorConstraint({ name: 'isValidCoverage', async: false })
export class IsValidCoverage implements ValidatorConstraintInterface {
  validate(_coverage: unknown) {
    if (_coverage === undefined) {
      return true;
    }
    if (_coverage === null) {
      // 把undefined的情况排出，有可能是blob数据
      // if (_coverage === null || _coverage === undefined) {
      return false;
    }
    const coverage =
      typeof _coverage === 'string' ? safeParseJSON(_coverage) : _coverage;
    if (Object.keys(coverage).length === 0) {
      return false;
    }
    return Object.values(coverage || {}).every((item) => {
      return isValidCoverage(item);
    });
  }

  defaultMessage() {
    return 'coverage格式不正确';
  }
}
