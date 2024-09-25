// @ts-nocheck
import React from "react";
import SummaryHeader from "./components/SummaryHeader";
import { useEffect, useMemo, useState } from "react";
import SummaryListTable from "./components/SummaryListTable";
// import { Button, Table } from "antd";
import TopControl from "./components/TopControl";
import FileCoverageDetail from "./components/FileCoverageDetail";
// import { codeToHtml } from "shiki";

/**
 * 这是一个示例组件。
 * @param {Object} props - 组件的属性。
 * @param {string} props.name - 名称。
 * @param {number} props.age - 年龄。
 */
// eslint-disable-next-line react/prop-types
function Report({ dataSource, value, loading, onSelect, loadData }) {
  const isFile = useMemo(() => {
    return value.includes(".");
  }, [value]);

  const [fileCoverage, setFileCoverage] = useState(null);
  const [fileContent, setFileContent] = useState(null);

  function newonSelect(val) {
    return onSelect(val).then((res) => {
      setFileContent(res?.fileContent);
      setFileCoverage(res?.fileCoverage);
      return res;
    });
  }

  useEffect(() => {
    newonSelect(value);
  }, []);

  return (
    <div className={""}>
      <TopControl />
      <SummaryHeader value={value || ""} onSelect={newonSelect} />

      {isFile ? (
        <FileCoverageDetail fileContent={fileContent} />
      ) : (
        <SummaryListTable dataSource={dataSource} onSelect={newonSelect} />
      )}
      {/*{JSON.stringify(dataSource)}*/}
      {/*<div*/}
      {/*  dangerouslySetInnerHTML={{*/}
      {/*    __html: value,*/}
      {/*  }}*/}
      {/*></div>*/}

      {/*<Button>你好呀</Button>*/}
      {/*<Table/>*/}
    </div>
  );
}

export default Report;
