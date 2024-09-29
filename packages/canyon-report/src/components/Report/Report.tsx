import React, { FC } from "react";
import SummaryHeader from "./components/SummaryHeader";
import { useEffect, useMemo, useState } from "react";
import SummaryListTable from "./components/SummaryListTable";
import TopControl from "./components/TopControl";
import FileCoverageDetail from "./components/FileCoverageDetail";
import { ReportProps } from "./types";
import { FileCoverageData } from "istanbul-lib-coverage";

const Report: FC<ReportProps> = ({ dataSource, value, onSelect }) => {
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

  return (
    <div className={""}>
      <TopControl
        total={
          dataSource.filter((item) => {
            return item.path.startsWith(value);
          }).length
        }
      />
      <SummaryHeader value={value || ""} onSelect={newonSelect} />

      {isFile ? (
        <FileCoverageDetail fileContent={fileContent} />
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
