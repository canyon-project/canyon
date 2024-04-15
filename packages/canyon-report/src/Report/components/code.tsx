import { FC } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';
import { codeToHtml } from 'shiki';

import { coreFn, genDecorationsLv2Array } from '../../helper.ts';
import LineCoverage from './line/coverage.tsx';
import LineNew from './line/new.tsx';
import LineNumber from './line/number.tsx';

const Code: FC<{
  filePath: string;
  fileCoverage: any;
  fileContent: string;
  fileCodeChange: number[];
  theme: string;
}> = ({ fileCoverage, fileContent: code, fileCodeChange, theme, filePath }) => {
  // const code = `const a=1`
  const [html, setHtml] = useState('');
  const { lines } = coreFn(fileCoverage, code);
  useEffect(() => {
    if (fileCoverage && JSON.stringify(fileCoverage) !== JSON.stringify({})) {
      // 语句标记
      const originalMarksStatement: any = [];
      const statementStats = fileCoverage.s;
      const statementMeta = fileCoverage.statementMap;
      Object.entries(statementStats).forEach(([stName, count]: any) => {
        const meta = statementMeta[stName];
        const type = count > 0 ? 'yes' : 'no';
        const startCol = meta.start.column;
        const endCol = meta.end.column;
        const startLine = meta.start.line - 1;
        const endLine = meta.end.line - 1;
        if (type === 'no') {
          originalMarksStatement.push({
            start: [startLine, startCol],
            end: [endLine, endCol],
          });
        }
      });
      const decorationsLv2Array = genDecorationsLv2Array(
        code,
        originalMarksStatement,
      );
      codeToHtml(code, {
        theme: theme === 'light' ? 'light-plus' : 'tokyo-night',
        lang: filePath.split('.').pop() as string,
        decorations: decorationsLv2Array.map(([line, startCol, endCol]) => {
          return {
            start: {
              line: line,
              character: startCol - 1 < 0 ? 0 : startCol,
            },
            end: {
              line: line,
              character: endCol - 1 < 0 ? 0 : endCol,
            },
            properties: { class: 'highlighted-word' },
          };
        }),
      }).then((h) => {
        setHtml(h);
      });
    }
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
      <LineNew news={fileCodeChange} count={code.split('\n').length} />
      <div
        style={{ flexGrow: 1, overflow: 'auto' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default Code;
