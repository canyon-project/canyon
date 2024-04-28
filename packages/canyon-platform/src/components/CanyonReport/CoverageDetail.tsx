// import LineCoverage from '@canyon/report/src/Report/components/line/coverage.tsx';
// import LineNew from '@canyon/report/src/Report/components/line/new.tsx';
// import LineNumber from '@canyon/report/src/Report/components/line/number.tsx';
import { DiffEditor, Editor } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

import { annotateFunctions, annotateStatements, coreFn } from './helper.tsx';
import LineCoverage from './line/coverage.tsx';
import LineNew from './line/new.tsx';
import LineNumber from './line/number.tsx';

// import { annotateFunctions, annotateStatements, coreFn } from './helper.tsx';
// import LineCoverage from './line/coverage.tsx';
// import LineNew from './line/new.tsx';
// import LineNumber from './line/number.tsx';
// import {coreFn} from "@canyon/report/src/helper.ts";
const CanyonReportCoverageDetail = ({ data,theme }) => {
  console.log(data, 'datasss');
  const code = data.sourcecode;
  const { lines } = coreFn(data.coverage, code);
  const decorations = useMemo(() => {
    if (data) {
      const annotateFunctionsList = annotateFunctions(data.coverage, data.sourcecode);
      const annotateStatementsList = annotateStatements(data.coverage);
      return [...annotateStatementsList, ...annotateFunctionsList].map((i) => {
        return {
          inlineClassName: 'content-class-found',
          startLine: i.startLine,
          startCol: i.startCol,
          endLine: i.endLine,
          endCol: i.endCol,
        };
      });
    } else {
      return [];
    }
  }, [data]);

  const [editor, setEditor] = useState<any>(false);
  const editorRef = useRef(null);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
    setEditor(editor);
  }
  useEffect(() => {
    if (editor) {
      editor?.deltaDecorations?.(
        [], // oldDecorations 每次清空上次标记的
        decorations.map(({ inlineClassName, startLine, startCol, endLine, endCol }) => ({
          range: new monaco.Range(startLine, startCol, endLine, endCol),
          options: {
            isWholeLine: false,
            inlineClassName: inlineClassName,
          },
        })),
      );
      // 监听编辑器的滚动事件
      editor.onDidScrollChange(function (e) {
        console.log(e);
        // e.preventDefault(); // 阻止默认行为
      });
    }
  }, [editor, decorations]);
  return (
    <div
      style={{
        display: 'flex',
        fontSize: '12px',
        lineHeight: '14px',
        // backgroundColor: theme === 'dark' ? '#1a1b26' : 'white',
      }}
    >
      <LineNumber theme={theme} count={code.split('\n').length} />
      <LineNew count={code.split('\n').length} news={data?.newlines || []}></LineNew>
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

      <Editor
        theme={theme === 'light' ? 'light' : 'vs-dark'}
        height={`${code.split('\n').length * 18 + 36}px`}
        language='typescript'
        onMount={handleEditorDidMount}
        defaultValue={data?.sourcecode}
        options={{
          lineNumbers: 'off',
          readOnly: true,
          folding: false,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          showUnused: false,
          // scrollbar: {
          //   vertical: 'hidden',
          // },
          // smoothScrolling: false,
          // mouseWheelScrollSensitivity
        }}
      />
    </div>
  );
};

export default CanyonReportCoverageDetail;
