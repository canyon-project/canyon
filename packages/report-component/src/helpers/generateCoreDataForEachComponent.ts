import { genSummaryTreeItem } from 'canyon-data';

function checkSummaryOnlyChange(
  item: { change: boolean },
  onlyChange: boolean,
) {
  // 如果只看改变的为false，就返回全部
  if (onlyChange === false) {
    return true;
  }
  // 不然就检查item.change
  if (onlyChange && item.change) {
    return true;
  }
  return false;
}
function checkSummaryKeywords(item: { path: string }, keywords: string) {
  return item.path.toLowerCase().includes(keywords.toLowerCase());
}

function checkStartValue(item: { path: string }, startValue: string) {
  return item.path.toLowerCase().includes(startValue.toLowerCase());
}

interface DataSourceItem {
  path: string;
  change: boolean;
  [key: string]: unknown;
}

export const generateCoreDataForEachComponent = ({
  dataSource,
  filenameKeywords,
  value,
  onlyChange,
}: {
  dataSource: DataSourceItem[];
  filenameKeywords: string;
  value: string;
  onlyChange: boolean;
}) => {
  const listDataSource = Object.values(dataSource).filter(
    (item: DataSourceItem) =>
      checkStartValue(item, value) &&
      checkSummaryOnlyChange(item, onlyChange) &&
      checkSummaryKeywords(item, filenameKeywords),
  );
  const summary = listDataSource.reduce(
    (acc: Record<string, DataSourceItem>, cur: DataSourceItem) => {
      acc[cur.path] = cur;
      return acc;
    },
    {},
  );

  const aaaa = genSummaryTreeItem(value, summary);
  return {
    treeDataSource: aaaa.children.map((item) => {
      return {
        path: item.path,
        ...item.summary,
      };
    }),
    rootDataSource: {
      path: aaaa.path,
      ...aaaa.summary,
    },
    listDataSource: listDataSource,
  };
};
