import { genSummaryTreeItem } from "canyon-data";

function checkSummaryOnlyChange(item, onlyChange) {
  // 如果只看改变的为false，就返回全部
  if (onlyChange === false) {
    return true;
  }
  // 不然就检查item.change
  if (onlyChange && item.change) {
    return true;
  } else {
    return false;
  }
}
function checkSummaryKeywords(item, keywords) {
  return item.path.toLowerCase().includes(keywords.toLowerCase());
}

function checkStartValue(item, startValue) {
  return item.path.toLowerCase().includes(startValue.toLowerCase());
}

function checkSummaryRange(item, range) {
  const pct = item.statements.pct;
  return pct >= range[0] && pct <= range[1];
}

export const generateCoreDataForEachComponent = ({
  dataSource,
  filenameKeywords,
  value,
  onlyChange,
}) => {
  const listDataSource: any = Object.values(dataSource).filter(
    (item) =>
      checkStartValue(item, value) &&
      checkSummaryOnlyChange(item, onlyChange) &&
      checkSummaryKeywords(item, filenameKeywords),
  );
  // @ts-ignore
  const summary = listDataSource
    // @ts-ignore
    .reduce((acc: never, cur: never) => {
      // @ts-ignore
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
