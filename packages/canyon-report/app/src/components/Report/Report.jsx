import SummaryHeader from "./components/SummaryHeader";
import { useEffect } from "react";
import SummaryListTable from "./components/SummaryListTable.jsx";
import {Button, Table} from "antd";
// import { codeToHtml } from "shiki";

/**
 * 这是一个示例组件。
 * @param {Object} props - 组件的属性。
 * @param {string} props.name - 名称。
 * @param {number} props.age - 年龄。
 */
// eslint-disable-next-line react/prop-types
function Editor({
                  dataSource,
                  value,
                  loading,
                  onSelect,
                  loadData
}) {
  // const [value, setValue] = useState("");

  useEffect(() => {
    // const code = "const a = 1"; // 输入代码片段
    // codeToHtml(code, {
    //   lang: "javascript",
    //   theme: "vitesse-dark",
    // }).then((r) => {
    //   setValue(r);
    // });
  }, []);
  return (
    <div className={''}>
      {/*<SummaryHeader />*/}
      {/*<SummaryListTable />*/}
      {/*{JSON.stringify(coverageSummaryData)}*/}
      {/*<div*/}
      {/*  dangerouslySetInnerHTML={{*/}
      {/*    __html: value,*/}
      {/*  }}*/}
      {/*></div>*/}

      <Button>你好呀</Button>
      <Table/>
    </div>
  );
}

export default Editor;
