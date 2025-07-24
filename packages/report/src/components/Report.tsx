import { useTrans } from "../locales";
import { ReportProps } from "../types";
import { FC, useEffect, useMemo, useState } from "react";
import TopControl from "./widgets/TopControl";
import { FileCoverageData } from "istanbul-lib-coverage";
import SummaryHeader from "./widgets/SummaryHeader";
import SummaryList from "./widgets/SummaryList";
import SummaryTree from "./widgets/SummaryTree";
import CoverageDetail from "./widgets/CoverageDetail";
import { generateCoreDataForEachComponent } from "./helpers/generateCoreDataForEachComponent";

const ReportComponent: FC<ReportProps> = ({
  theme,
  onSelect,
  value,
  dataSource,
  name,
}) => {
  console.log(theme, onSelect, value);
  const t = useTrans();

  // 内部状态
  const [filenameKeywords, setFilenameKeywords] = useState("");
  const [showMode, setShowMode] = useState("tree");
  const [fileCoverage, setFileCoverage] = useState<FileCoverageData>({
    path: "",
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {},
  });
  const [fileContent, setFileContent] = useState<string>("");
  const [fileCodeChange, setFileCodeChange] = useState<number[]>([]);
  const [onlyChange, setOnlyChange] = useState(Boolean(false));

  function onChangeOnlyChange(v) {
    setOnlyChange(v);
  }
  async function newOnSelect(val: string) {
    const res = await onSelect(val);
    setFileContent(res.fileContent);
    setFileCoverage(res.fileCoverage);
    setFileCodeChange(res.fileCodeChange);
    return res;
  }
  useEffect(() => {
    newOnSelect(value);
  }, []);
  const isFile = useMemo(() => {
    // Check if it's a file by common frontend file extensions
    const isFile = /\.(js|jsx|ts|tsx|vue)$/.test(value);
    return isFile;
  }, [value]);
  const mode = useMemo(() => {
    if (isFile) {
      return "file";
    } else {
      return showMode;
    }
  }, [showMode, value]);

  const { treeDataSource, rootDataSource, listDataSource } = useMemo(() => {
    return generateCoreDataForEachComponent({
      dataSource,
      filenameKeywords,
      value,
      onlyChange,
    });
  }, [dataSource, value, filenameKeywords, onlyChange]);

  return (
    <>
      <TopControl
        onlyChange={onlyChange}
        filenameKeywords={filenameKeywords}
        showMode={showMode}
        onChangeShowMode={(val) => {
          setShowMode(val);
        }}
        onChangeOnlyChange={onChangeOnlyChange}
        total={listDataSource.length}
        onChangeKeywords={(val) => {
          setFilenameKeywords(val);
        }}
      />
      <SummaryHeader
        reportName={name}
        data={rootDataSource}
        value={value}
        onSelect={newOnSelect}
      />
      {mode === "file" &&
        Object.keys(fileCoverage).length > 0 &&
        Object.keys(fileContent).length > 0 && (
          <CoverageDetail
            fileContent={fileContent}
            fileCodeChange={fileCodeChange}
            fileCoverage={fileCoverage}
            theme={theme}
          />
        )}
      <div>
        <SummaryTree
          style={{
            display: mode === "tree" ? "block" : "none",
          }}
          dataSource={treeDataSource}
          onSelect={newOnSelect}
        />
        <SummaryList
          style={{
            display: mode === "list" ? "block" : "none",
          }}
          dataSource={listDataSource}
          onSelect={newOnSelect}
          filenameKeywords={filenameKeywords}
        />
      </div>
    </>
  );
};

export default ReportComponent;
