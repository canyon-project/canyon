import { percent } from '@/helper/utils.ts';

// 功能描述型
export function calculateCoveragePercentage(
  coverage: any,
  dimension = 'statements',
) {
  return percent(coverage[dimension].covered, coverage[dimension].total);
}
