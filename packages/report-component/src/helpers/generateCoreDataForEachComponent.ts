import { genSummaryTreeItem } from 'canyon-data';

function checkSummaryOnlyChange(item: any, onlyChange: boolean) {
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
function checkSummaryKeywords(item: any, keywords: string) {
  return item.path.toLowerCase().includes(keywords.toLowerCase());
}

function checkStartValue(item: any, startValue: string) {
  return item.path.toLowerCase().includes(startValue.toLowerCase());
}

export const generateCoreDataForEachComponent = ({
  dataSource,
  filenameKeywords,
  value,
  onlyChange,
}: {
  dataSource: any[];
  filenameKeywords: string;
  value: string;
  onlyChange: boolean;
}) => {
  const listDataSource = Object.values(dataSource).filter(
    (item: any) =>
      checkStartValue(item, value) &&
      checkSummaryOnlyChange(item, onlyChange) &&
      checkSummaryKeywords(item, filenameKeywords),
  );
  const summary = listDataSource.reduce((acc: any, cur: any) => {
    acc[cur.path] = cur;
    return acc;
  }, {});

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
