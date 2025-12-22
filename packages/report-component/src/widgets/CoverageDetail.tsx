import type * as Monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import {
  annotateBranches,
  annotateFunctions,
  annotateStatements,
} from '../helpers/annotate';
import { coreFn } from '../helpers/coreFn';
import lineNumbers from './lineNumbers';

// 扩展 Window 接口以包含 monaco
declare global {
  interface Window {
    monaco?: typeof Monaco;
  }
}

interface coverage {
  [key: string]: unknown;
}

interface Diff {
  additions: number[];
  deletions: number[];
}

const CoverageDetail = ({
  source,
  coverage,
  diff,
}: {
  source: string;
  coverage: coverage;
  diff: Diff;
}) => {
  // 使用 diff 避免未使用参数警告
  const { lines } = coreFn(coverage, source);

  const addLines = diff.additions || [];

  const linesState = (() => {
    return lines.map((line, index) => {
      return {
        lineNumber: index + 1,
        change: addLines.includes(index + 1),
        hit: line.executionNumber,
      };
    });
  })();
  const lineNumbersMinChars = (() => {
    const maxHit = Math.max(...linesState.map((line) => line.hit));
    return maxHit.toString().length + 8;
  })();
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      const dom = ref.current;
      const options = {
        value: source,
        language: 'javascript',
        fontFamily: 'IBMPlexMono',
        lineHeight: 18,
        lineNumbers: (lineNumber: number) => {
          return lineNumbers(lineNumber, linesState);
        },
        lineNumbersMinChars: lineNumbersMinChars,
        readOnly: true,
        folding: false,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        showUnused: false,
        fontSize: 12,
        contextmenu: false,
        automaticLayout: true,
      };

      if (window.monaco?.editor && dom) {
        // 如果已经加载，直接创建编辑器
        const editor = window.monaco.editor.create(dom, options);

        const decorations = (() => {
          const all = [];

          const annotateStatementsList = annotateStatements(coverage);
          all.push(...annotateStatementsList);

          const annotateFunctionsList = annotateFunctions(coverage, source);
          all.push(...annotateFunctionsList);

          const annotateBranchesList = annotateBranches(coverage, source);
          all.push(...annotateBranchesList);

          const arr = [];

          for (let i = 0; i < all.length; i++) {
            const {
              startLine,
              startCol,
              endLine,
              endCol,
              // type,
            } = all[i];

            if (all[i].type === 'S' || all[i].type === 'F') {
              arr.push({
                range: new window.monaco.Range(
                  startLine,
                  startCol,
                  endLine,
                  endCol,
                ), // 第3行第5列前插入
                options: {
                  isWholeLine: false,
                  inlineClassName: 'content-class-no-found',
                },
              });
            } else if (all[i].type === 'B') {
              arr.push({
                range: new window.monaco.Range(
                  startLine,
                  startCol,
                  endLine,
                  endCol,
                ), // 第3行第5列前插入
                options: {
                  isWholeLine: false,
                  inlineClassName: 'content-class-no-found-branch',
                },
              });
            } else if (all[i].type === 'I') {
              arr.push({
                range: new window.monaco.Range(
                  startLine,
                  startCol,
                  startLine,
                  startCol,
                ), // 第3行第5列前插入
                options: {
                  beforeContentClassName: 'insert-i-decoration',
                  stickiness:
                    window.monaco.editor.TrackedRangeStickiness
                      .NeverGrowsWhenTypingAtEdges,
                },
              });
            } else if (all[i].type === 'E') {
              arr.push({
                range: new window.monaco.Range(
                  startLine,
                  startCol,
                  startLine,
                  startCol,
                ), // 第3行第5列前插入
                options: {
                  beforeContentClassName: 'insert-e-decoration',
                  stickiness:
                    window.monaco.editor.TrackedRangeStickiness
                      .NeverGrowsWhenTypingAtEdges,
                },
              });
            }
          }

          return arr;
        })();

        if (editor) {
          editor?.createDecorationsCollection?.(decorations);
        }
      }
    }
  }, [source]);
  return (
    <div>
      <div ref={ref} style={{ height: 'calc(100vh - 150px)' }} />
    </div>
  );
};

export default CoverageDetail;
