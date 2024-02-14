// import {useEffect, useState} from "react";
import { codeToHtml } from 'shiki';

// import { code as code1 } from '../code.ts';
// import { coreFn } from '../helper.ts';
// import LineCount from "./line-count.tsx";
// import LineCoverage from "./line-coverage.tsx";
// import LineNew from "./line-new.tsx";
// import fileCoverage from '../meta/coverage.json';
import LineCoverage from './line/coverage.tsx';
import LineNew from './line/new.tsx';
import LineNumber from './line/number.tsx';
import {coreFn} from "../../helper.ts";
import {useEffect, useState} from "preact/hooks";
import {FC} from "preact/compat";
function getDecode(str: string) {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
}
// const code = getDecode(code1);
const Code:FC<{
  fileCoverage: any;
  fileContent: string;
  fileCodeChange: number[];
  theme:string
}> = ({ fileCoverage, fileContent:code, fileCodeChange,theme }) => {
  console.log(theme)
  // const code = `const a=1`
  const [html, setHtml] = useState('');
  const { lines } = coreFn(fileCoverage, code);
  // console.log(lines,'lines')
  useEffect(() => {
    codeToHtml(code, {
      theme: theme === 'light' ? 'light-plus' : 'tokyo-night',
      lang: 'tsx',
      decorations: [],
    }).then((h) => {
      setHtml(h);
    });
  }, [theme]);

  return (
    <div
      style={{
        display: 'flex',
        fontSize: '12px',
        lineHeight: '14px',
        backgroundColor: theme === 'dark' ? '#1a1b26' : 'white',
      }}
    >
      <LineNumber theme={theme} count={code.split('\n').length} />
      <LineCoverage
        theme={theme}
        covers={lines.map((i) => {
          if (i.executionNumber > 0) {
            return {
              covered: 'yes',
              hits: i.executionNumber,
            };
          } else if (i.executionNumber === 0) {
            return {
              covered: 'no',
              hits: i.executionNumber,
            };
          } else {
            return {
              covered: 'neutral',
              hits: 0,
            };
          }
        })}
      />
      <LineNew news={fileCodeChange} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default Code;
