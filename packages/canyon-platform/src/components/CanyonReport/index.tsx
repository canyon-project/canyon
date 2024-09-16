import { genSummaryTreeItem } from "canyon-data";

import CanyonReportControl from "./Control.tsx";
import CanyonReportCoverageDetail from "./CoverageDetail.tsx";
import { checkSuffix } from "./helper.tsx";
import CanyonReportListTable from "./ListTable.tsx";
import CanyonReportOverview from "./Overview.tsx";
import CanyonReportTreeTable from "./TreeTable.tsx";

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
function checkSummaryRange(item, range) {
  const pct = item.statements.pct;
  return pct >= range[0] && pct <= range[1];
}

// 1.summary最主要的数据，有外面传入
// 2.当前默认defaultPath = sprm.get('path')，锚点
const CanyonReport = ({
  // summary,
  activatedPath,
  pathWithNamespace,
  coverageSummaryMapData,
  loading,
  onSelect,
  mainData,
  theme,
}) => {
  // 几个状态
  // 1.展示模式//tree||list
  const [showMode, setShowMode] = useState("tree");
  // 2.当前是文件还是文件夹
  const fMode = useMemo(() => {
    // return 获取当前path，判断是否含有 .
    return activatedPath.includes(".") && checkSuffix(activatedPath)
      ? "file"
      : "folder";
  }, [activatedPath]);
  // 3.是否只展示变更文件
  // 4.其他的放在各自的状态里

  // 5.文件路径关键字搜索
  const [keywords, setKeywords] = useState("");
  const [onlyChange, setOnlyChange] = useState(false);
  const [range, setRange] = useState([0, 100]);

  // useEffect(()=>{
  //   document.querySelector("#nihao").scrollIntoView(true);
  // },[])

  const coverageSummaryMapDataFiltered = useMemo(() => {
    return coverageSummaryMapData.filter(
      (item) =>
        checkSummaryOnlyChange(item, onlyChange) &&
        checkSummaryKeywords(item, keywords) &&
        checkSummaryRange(item, range),
    );
  }, [coverageSummaryMapData, onlyChange, keywords, range]);

  const summary = coverageSummaryMapDataFiltered.reduce(
    (acc: any, cur: any) => {
      acc[cur.path] = cur;
      return acc;
    },
    {},
  );
  const summaryTreeItem = genSummaryTreeItem(activatedPath, summary);
  function onChangeOnlyChangeKeywords(v) {
    setKeywords(v.target.value);
  }

  function onChangeOnlyChange(v) {
    // console.log(v,'v')
    setOnlyChange(v);
  }
  function onChangeShowMode(mode) {
    setShowMode(mode);
  }
  function onChangeRange(va) {
    setRange(va);
  }
  return (
    <div>
      <CanyonReportControl
        showMode={showMode}
        numberFiles={
          coverageSummaryMapDataFiltered.filter((item) =>
            item.path.includes(activatedPath),
          ).length
        }
        keywords={keywords}
        range={range}
        onlyChange={onlyChange}
        onChangeOnlyChange={onChangeOnlyChange}
        onChangeOnlyChangeKeywords={onChangeOnlyChangeKeywords}
        onChangeShowMode={onChangeShowMode}
        onChangeRange={onChangeRange}
      />
      <Divider style={{ margin: "0", marginBottom: "10px" }} />
      <CanyonReportOverview
        summaryTreeItem={summaryTreeItem}
        activatedPath={activatedPath}
        pathWithNamespace={pathWithNamespace}
        onSelect={onSelect}
      />
      {showMode === "tree" && fMode === "folder" && (
        <CanyonReportTreeTable
          onlyChange={onlyChange}
          dataSource={summaryTreeItem.children}
          loading={loading}
          activatedPath={activatedPath}
          onSelect={onSelect}
        />
      )}
      {showMode === "list" && fMode === "folder" && (
        <CanyonReportListTable
          onlyChange={onlyChange}
          onSelect={onSelect}
          keywords={keywords}
          loading={loading}
          dataSource={coverageSummaryMapDataFiltered.filter((item) =>
            item.path.includes(activatedPath),
          )}
        />
      )}
      <Spin spinning={!mainData && fMode === "file"}>
        {fMode === "file" && mainData && (
          <CanyonReportCoverageDetail
            theme={theme}
            data={{
              coverage: mainData?.fileCoverage,
              sourcecode: mainData?.fileContent,
              newlines: mainData?.fileCodeChange,
            }}
          />
        )}
      </Spin>

      <FloatButton.BackTop />
    </div>
  );
};

export default CanyonReport;
