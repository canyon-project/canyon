import { percent } from './utils';
import { CoverageSummaryData, Totals } from 'istanbul-lib-coverage';

export function calculateCoverageOverviewByConditionFilter(
  data,
): CoverageSummaryData & { newlines: Totals } {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return ['newlines', 'lines', 'statements', 'branches', 'functions'].reduce(
    (previousValue, currentValue) => {
      const ret = {
        total: data
          .filter(({ metricType }) => metricType === currentValue)
          .reduce((acc, item) => acc + item.total, 0),
        covered: data
          .filter(({ metricType }) => metricType === currentValue)
          .reduce((acc, item) => acc + item.covered, 0),
        skipped: data
          .filter(({ metricType }) => metricType === currentValue)
          .reduce((acc, item) => acc + item.skipped, 0),
        pct: 0,
      };
      ret.pct = percent(ret.covered, ret.total);
      return {
        ...previousValue,
        [currentValue]: ret,
      };
    },
    {},
  );
}
