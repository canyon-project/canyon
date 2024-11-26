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
import { Spin } from "antd";
import { genFileDetailLines, ggggggfn } from "../helpers/file";
// import { genFileDetailLines } from "../helpers";

const onSelectDefault = () => {
  return Promise.resolve({
    fileContent: "",
    fileCoverage: {},
  });
}

const Report: FC<ReportProps> = ({
  dataSource=[],
  value="",
  onSelect=onSelectDefault,
  reportName='untitled',
}) => {
  const [filenameKeywords, setFilenameKeywords] = useState("");
  // const [range, setRange] = useState([0, 100]);
  const [showMode, setShowMode] = useState("tree");
  const [loading, setLoading] = useState(false);

  const isFile = useMemo(() => {
    return value.includes(".");
  }, [value]);

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

  function newonSelect(val: string) {
    setLoading(true);
    return onSelect(val).then((res) => {
      setFileContent(res.fileContent);
      setFileCoverage(res.fileCoverage);
      setLoading(false);
      return res;
    });
  }

  useEffect(() => {
    newonSelect(value);
  }, []);

  const { treeDataSource, rootDataSource, listDataSource } = useMemo(() => {
    // 1.过滤

    const listDataSource = dataSource.filter((item) =>
      item.path.toLowerCase().includes(filenameKeywords.toLowerCase()),
    );
    // @ts-ignore
    const summary = listDataSource
      // @ts-ignore
      .reduce((acc: never, cur: never) => {
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
      listDataSource: listDataSource,
    };
  }, [dataSource, value, filenameKeywords]);

  return (
    <div className={""}>
      <TopControl
        filenameKeywords={filenameKeywords}
        showMode={showMode}
        onChangeShowMode={(val) => {
          setShowMode(val);
        }}
        total={
          dataSource.filter((item) => {
            return item.path.startsWith(value);
          }).length
        }
        onChangeKeywords={(val) => {
          setFilenameKeywords(val);
        }}
      />
      <SummaryHeader
        reportName={reportName}
        data={rootDataSource}
        value={value || ""}
        onSelect={newonSelect}
      />

      {isFile ? (
        <Spin spinning={loading}>
          {!loading && (
            <FileCoverageDetail
              dsss={ggggggfn(fileCoverage, fileContent)}
              fileContent={fileContent}
              lines={genFileDetailLines(fileCoverage, fileContent)}
            />
          )}
        </Spin>
      ) : showMode === "tree" ? (
        <CanyonReportTreeTable
          dataSource={treeDataSource}
          onSelect={newonSelect}
        />
      ) : (
        <SummaryListTable
          filenameKeywords={filenameKeywords}
          value={value}
          dataSource={listDataSource}
          onSelect={newonSelect}
        />
      )}
    </div>
  );
};

export default Report;
