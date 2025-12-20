import { useEffect, useRef } from 'react';
import {
  annotateBranches,
  annotateFunctions,
  annotateStatements,
} from '../helpers/annotate';
import { coreFn } from '../helpers/coreFn';
import lineNumbers from '../helpers/lineNumbers';

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
  // console.log({ diff, coverage }, 'coverage data');
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
          return lineNumbers(lineNumber, linesState, addLines);
        },
        lineNumbersMinChars: lineNumbersMinChars,
        readOnly: true,
        folding: false,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        showUnused: false,
        fontSize: 12,
        // fontFamily: "IBMPlexMono",
        contextmenu: false,
        automaticLayout: true, // 启用自动布局
      };

      if (window.monaco?.editor && dom) {
        // 如果已经加载，直接创建编辑器
        // @ts-expect-error
        const editor = window.monaco.editor.create(dom, options);

        const decorations = (() => {
          const all = [];

          const annotateStatementsList = annotateStatements(coverage, source);
          all.push(...annotateStatementsList);

          const annotateFunctionsList = annotateFunctions(coverage, source);
          all.push(...annotateFunctionsList);

          const annotateBranchesList = annotateBranches(coverage, source);
          all.push(...annotateBranchesList);

          console.log(all.length, 'all');

          const arr = [];

          for (let i = 0; i < all.length; i++) {
            const {
              startLine,
              startCol,
              endLine,
              endCol,
              // type,
            } = all[i];

            console.log(all[i].type, 'all[i].type');

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
                  hoverMessage: {
                    value:
                      all[i].type === 'S'
                        ? 'statement not covered'
                        : 'function not covered',
                  },
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
                  hoverMessage: { value: 'branch not covered' },
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

        console.log(decorations, 'decorations');

        if (editor) {
          editor?.deltaDecorations?.(
            [], // oldDecorations 每次清空上次标记的
            decorations,
          );
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
