import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";

import * as monaco from "monaco-editor";
import { annotateFunctions, annotateStatements } from "../helpers/annotate.ts";
import LineNumber from "./line/number.tsx";
import LineNew from "./line/new.tsx";
import LineCoverage from "./line/coverage.tsx";
import { coreFn } from "../helpers/coreFn.ts";

const FileCoverageDetail: FC<{
  fileContent: string;
  fileCodeChange: number[];
  fileCoverage: any;
}> = ({ fileContent, fileCoverage, fileCodeChange }) => {
  const lineCount = fileContent.split("\n").length;
  const { lines } = coreFn(fileCoverage, fileContent);
  const decorations = useMemo(() => {
    const annotateFunctionsList = annotateFunctions(fileCoverage, fileContent);
    const annotateStatementsList = annotateStatements(fileCoverage);
    return [...annotateStatementsList, ...annotateFunctionsList].map((i) => {
      return {
        inlineClassName: "content-class-found",
        startLine: i.startLine,
        startCol: i.startCol,
        endLine: i.endLine,
        endCol: i.endCol,
      };
    });
  }, []);

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
        decorations.map(
          ({ inlineClassName, startLine, startCol, endLine, endCol }) => ({
            range: new monaco.Range(startLine, startCol, endLine, endCol),
            options: {
              isWholeLine: false,
              inlineClassName: inlineClassName,
            },
          }),
        ),
      );
    }
  }, [editor, decorations]);

  return (
    <div
      style={{
        display: "flex",
        fontSize: "12px",
        // lineHeight: "14px",
      }}
    >
      <Editor
        value={fileContent}
        // theme={"nightOwl"}
        height={"calc(100vh - 200px)"}
        // height={`${18 * (lineCount + 1)}px`}
        language={"javascript"}
        onMount={handleEditorDidMount}
        options={{
          lineHeight: 18,
          lineNumbers: (lineNumber) => {
            // 根据行号生成标识，后续会处理逻辑
            return `<div class="line-number-wrapper">
              <span class="line-number">${lineNumber}</span>
              <span class="line-change">change</span>
              <span class="line-coverage">coverage</span>
            </div>`;
          },
          lineNumbersMinChars: 20,
          readOnly: true,
          folding: false,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          showUnused: false,
          fontSize: 12,
          fontFamily: "IBMPlexMono",
          scrollbar: {
            // handleMouseWheel: false,
          },
          contextmenu: false,
        }}
      />
    </div>
  );
};

export default FileCoverageDetail;
