import React, { FC } from "react";
import SummaryHeader from "./components/SummaryHeader";
import { useEffect, useMemo, useState } from "react";
import SummaryListTable from "./components/SummaryListTable";
import TopControl from "./components/TopControl";
import FileCoverageDetail from "./components/FileCoverageDetail";
import { ReportProps } from "./types";
import { FileCoverageData } from "istanbul-lib-coverage";
import CanyonReportTreeTable from "./components/SummaryTreeTable";
import { genSummaryTreeItem } from "canyon-data";
const Report: FC<ReportProps> = ({ dataSource, value, onSelect }) => {
  // 1.展示模式//tree||list
  const [showMode, setShowMode] = useState("tree");

  const isFile = useMemo(() => {
    return value.includes(".");
  }, [value]);

  const [, setFileCoverage] = useState<FileCoverageData>({
    path: "",
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {},
  });
  const [fileContent, setFileContent] = useState<string>("");

  function newonSelect(val: string) {
    return onSelect(val).then((res) => {
      setFileContent(res.fileContent);
      setFileCoverage(res.fileCoverage);
      return res;
    });
  }

  useEffect(() => {
    newonSelect(value);
  }, []);

  const { treeDataSource, rootDataSource } = useMemo(() => {
    // @ts-ignore
    const summary = dataSource.reduce((acc: never, cur: never) => {
      // @ts-ignore
      acc[cur.path] = cur;
      return acc;
    }, {});

    // @ts-ignore
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
    };
  }, [dataSource, value]);

  return (
    <div className={""}>
      <TopControl
        showMode={showMode}
        onChangeShowMode={(val) => {
          setShowMode(val);
        }}
        total={
          dataSource.filter((item) => {
            return item.path.startsWith(value);
          }).length
        }
      />
      <SummaryHeader
        data={rootDataSource}
        value={value || ""}
        onSelect={newonSelect}
      />

      {isFile ? (
        <FileCoverageDetail fileContent={fileContent} />
      ) : showMode === "tree" ? (
        <CanyonReportTreeTable
          dataSource={treeDataSource}
          onSelect={newonSelect}
        />
      ) : (
        <SummaryListTable
          value={value}
          dataSource={dataSource}
          onSelect={newonSelect}
        />
      )}
    </div>
  );
};

export default Report;
