import type * as Monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import {
  annotateBranches,
  annotateFunctions,
  annotateStatements,
} from '../helpers/annotate';
import { changeModeFilterIrrelevantData } from '../helpers/changeModeFilterIrrelevantData';
import { coreFn } from '../helpers/coreFn';
import ChangedCodeCoverageTable, {
  type ChangedCodeCoverageTableProps,
} from './ChangedCodeCoverageTable';
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

/*有两个模式
1. 无变更行数据
2. 有变更行数据
*/

const CoverageDetail = ({
  source,
  coverage,
  diff,
}: {
  source: string;
  coverage: coverage;
  diff: Diff;
}) => {
  const addLines = diff.additions || [];
  console.log(addLines,'addLines')
  coverage = addLines.length>0?changeModeFilterIrrelevantData(coverage, diff):coverage

  const { lines } = coreFn(coverage, source);

  const ref = useRef<HTMLDivElement>(null);

  // 检查是否有变更行数据
  const hasChangedLines =
    addLines.length > 0 && coverage['s'] && coverage['statementMap'];

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
    return maxHit.toString().length + 9; // 额外留出一些空间
  })();

  useEffect(() => {
    if (ref.current && ref.current.innerHTML === '') {
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
  }, [source, coverage]);

  return (
    <div
      className='canyon-coverage-detail-container'
      style={{ height: '100%', position: 'relative' }}
    >
      {hasChangedLines ? (
        <ChangedCodeCoverageTable
          coverage={coverage as ChangedCodeCoverageTableProps['coverage']}
          addLines={addLines}
        />
      ) : null}
      <div
        ref={ref}
        className='canyon-coverage-detail-editor'
        style={{
          height: hasChangedLines ? 'calc(100% - 33px)' : '100%',
          top: hasChangedLines ? '33px' : '0',
          position: 'absolute',
          left: 0,
          right: 0,
        }}
      />
    </div>
  );
};

export default CoverageDetail;
