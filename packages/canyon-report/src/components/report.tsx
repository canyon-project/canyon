import { ReportProps } from "./types";
import { FC, useEffect, useMemo, useState } from "react";
import TopControl from "./widgets/TopControl";
import { FileCoverageData } from "istanbul-lib-coverage";
import SummaryHeader from "./widgets/SummaryHeader.tsx";
import SummaryTreeTable from "./widgets/SummaryTreeTable.tsx";
import SummaryListTable from "./widgets/SummaryListTable.tsx";
import FileCoverageDetail from "./widgets/FileCoverageDetail.tsx";
import { genSummaryTreeItem } from "canyon-data";
const onSelectDefault = () => {
  return Promise.resolve({
    fileContent: "",
    fileCoverage: {},
    fileCodeChange: [],
  });
};
const Report: FC<ReportProps> = ({
  name = "untitled", // 报告名称
  dataSource = {}, // 数据源，概览的map
  value = "", // 当前选中的文件路径
  onSelect = onSelectDefault, // 选中文件的回调，返回文件内容和覆盖率，promise
}) => {
  const [filenameKeywords, setFilenameKeywords] = useState("");
  const [showMode, setShowMode] = useState("tree");
  const [loading, setLoading] = useState(false);

  function newonSelect(val: string) {
    setLoading(true);
    return onSelect(val).then((res) => {
      console.log(res, "??????");
      setFileContent(res.fileContent);
      setFileCoverage(res.fileCoverage);
      setLoading(false);
      return res;
    });
  }

  useEffect(() => {
    newonSelect(value);
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

  const { treeDataSource, rootDataSource, listDataSource } = useMemo(() => {
    // 1.过滤

    const listDataSource = Object.values(dataSource).filter((item) =>
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
    <div>
      <TopControl
        filenameKeywords={filenameKeywords}
        showMode={showMode}
        onChangeShowMode={(val) => {
          setShowMode(val);
        }}
        total={
          Object.keys(dataSource).filter((item) => item.startsWith(value))
            .length
        }
        onChangeKeywords={(val) => {
          setFilenameKeywords(val);
        }}
      />
      <SummaryHeader
        reportName={name}
        data={rootDataSource}
        value={value}
        onSelect={newonSelect}
      />
      {/*{isFile && <FileCoverageDetail />}*/}
      {/*{showMode === "tree" && <SummaryTreeTable dataSource={} onSelect={} />}*/}
      {/*{showMode === "list" && <SummaryListTable dataSource={} onSelect={} />}*/}
      {mode === "file" &&
        Object.keys(fileCoverage).length > 0 &&
        Object.keys(fileContent).length > 0 && (
          <FileCoverageDetail
            fileContent={fileContent}
            lines={[]}
            fileCoverage={fileCoverage}
          />
        )}
      <div>
        <SummaryTreeTable
          style={{
            display: mode === "tree" ? "block" : "none",
          }}
          dataSource={treeDataSource}
          onSelect={newonSelect}
          filenameKeywords={filenameKeywords}
        />
        <SummaryListTable
          style={{
            display: mode === "list" ? "block" : "none",
          }}
          dataSource={listDataSource}
          onSelect={newonSelect}
          filenameKeywords={filenameKeywords}
        />
      </div>
    </div>
  );
};

export default Report;
