import { ReportProps } from "./types";
import { FC, useEffect, useMemo, useState } from "react";
import TopControl from "./widgets/TopControl";
import { FileCoverageData } from "istanbul-lib-coverage";
import SummaryHeader from "./widgets/SummaryHeader.tsx";
import SummaryTreeTable from "./widgets/SummaryTreeTable.tsx";
import SummaryListTable from "./widgets/SummaryListTable.tsx";
import FileCoverageDetail from "./widgets/FileCoverageDetail.tsx";
import { emptyFileCoverageData } from "./helpers/const.ts";
import { generateCoreDataForEachComponent } from "./helpers/generateCoreDataForEachComponent.ts";
import { FloatButton } from "antd";
import { css } from "@emotion/react";
const onSelectDefault = () => {
  return Promise.resolve({
    fileContent: "",
    fileCoverage: emptyFileCoverageData,
    fileCodeChange: [],
  });
};

const Report: FC<ReportProps> = ({
  name = "untitled", // 报告名称
  dataSource = {}, // 数据源，概览的map
  value = "", // 当前选中的文件路径
  onSelect = onSelectDefault, // 选中文件的回调，返回文件内容和覆盖率，promise
  defaultOnlyShowChanged = false,
}) => {
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
  const [onlyChange, setOnlyChange] = useState(Boolean(defaultOnlyShowChanged));

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
    return value.includes(".");
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

  function onChangeOnlyChange(v) {
    setOnlyChange(v);
  }

  return (
    <div
      css={css`
        /*新版canyon-report*/

        .line-number-wrapper {
          display: flex;
          /*从右边开始*/
          justify-content: flex-end;
          /*text-align: right;*/
        }

        .line-number-wrapper .line-number {
          /*width: 60px;*/
          padding-right: 5px;
        }

        .line-number-wrapper .line-change {
          width: 4px;
          /*display: block;*/
        }

        .line-number-wrapper .line-coverage {
          width: 60px;
          padding-right: 5px;
          color: rgba(0, 0, 0, 0.5);
        }

        .dark .line-number-wrapper .line-coverage {
          width: 60px;
          padding-right: 5px;
          color: #eaeaea;
        }

        /*额外的*/
        .content-class-no-found {
          background: #f6c6ce;
        }

        .dark .content-class-no-found {
          background: rgb(122, 84, 116);
        }
      `}
    >
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
          <FileCoverageDetail
            fileContent={fileContent}
            fileCodeChange={fileCodeChange}
            fileCoverage={fileCoverage}
          />
        )}
      <div>
        <SummaryTreeTable
          style={{
            display: mode === "tree" ? "block" : "none",
          }}
          dataSource={treeDataSource}
          onSelect={newOnSelect}
        />
        <SummaryListTable
          style={{
            display: mode === "list" ? "block" : "none",
          }}
          dataSource={listDataSource}
          onSelect={newOnSelect}
          filenameKeywords={filenameKeywords}
        />
      </div>
      <FloatButton.BackTop />
    </div>
  );
};

export default Report;
