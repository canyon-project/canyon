import { coreFn } from "./helper.tsx";
import LineCoverage from "./line/coverage.tsx";
import LineNew from "./line/new.tsx";
import LineNumber from "./line/number.tsx";
import ShikiDetail from "./ShikiDetail.tsx";

const CanyonReportCoverageDetail = ({ data, theme }: any) => {
  const code = data.sourcecode;
  const { lines } = coreFn(data.coverage, code);
  return (
    <>
      <div
        className={"canyon-report"}
        style={{
          display: "flex",
          fontSize: "12px",
          lineHeight: "14px",
          // backgroundColor: theme === 'dark' ? '#1a1b26' : 'white',
        }}
      >
        <LineNumber theme={theme} count={code.split("\n").length} />
        <LineNew
          count={code.split("\n").length}
          news={data?.newlines || []}
        ></LineNew>
        <LineCoverage
          theme={theme}
          covers={lines.map((i) => {
            if (i.executionNumber > 0) {
              return {
                covered: "yes",
                hits: i.executionNumber,
              };
            } else if (i.executionNumber === 0) {
              return {
                covered: "no",
                hits: i.executionNumber,
              };
            } else {
              return {
                covered: "neutral",
                hits: 0,
              };
            }
          })}
        />
        <ShikiDetail
          defaultValue={data?.sourcecode}
          filecoverage={data.coverage}
          theme={theme}
        />
      </div>
    </>
  );
};

export default CanyonReportCoverageDetail;
