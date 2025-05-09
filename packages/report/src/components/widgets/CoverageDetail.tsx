import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";

// import * as monaco from "monaco-editor";
import {
  annotateBranches,
  annotateFunctions,
  annotateStatements,
} from "../helpers/annotate";
import { coreFn } from "../helpers/coreFn";
import { theme } from "antd";
import { lineNumbers } from "../helpers/lineNumbers";
const { useToken } = theme;
const FileCoverageDetail: FC<{
  fileContent: string;
  fileCodeChange: number[];
  fileCoverage: any;
}> = ({ fileContent, fileCoverage, fileCodeChange }) => {
  const { token } = useToken();
  const { lines } = coreFn(fileCoverage, fileContent);

  const linesState = useMemo(() => {
    return lines.map((line, index) => {
      return {
        lineNumber: index + 1,
        change: fileCodeChange.includes(index + 1),
        hit: line.executionNumber,
      };
    });
  }, [lines, fileCodeChange]);

  const lineNumbersMinChars = useMemo(() => {
    const maxHit = Math.max(...linesState.map((line) => line.hit));
    return maxHit.toString().length + 8;
  }, [linesState]);

  const decorations = useMemo(() => {
    const annotateFunctionsList = annotateFunctions(fileCoverage, fileContent);
    const annotateStatementsList = annotateStatements(fileCoverage);
    const annotateBranchesList = annotateBranches(fileCoverage, fileContent);
    return [
      ...annotateStatementsList,
      ...annotateFunctionsList,
      ...annotateBranchesList,
    ].map((i) => {
      return {
        inlineClassName: "content-class-no-found",
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
            range: new window.monaco.Range(
              startLine,
              startCol,
              endLine,
              endCol,
            ),
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
        // border: "1px solid " + token.colorBorder,
      }}
    >
      <Editor
        value={fileContent}
        theme={token.colorBgBase === "#000" ? "nightOwl" : "vs"}
        height={"calc(100vh - 220px)"}
        // height={`${18 * (lineCount + 1)}px`}
        language={"javascript"}
        onMount={handleEditorDidMount}
        options={{
          lineHeight: 18,
          lineNumbers: (lineNumber) => {
            return lineNumbers(
              lineNumber,
              linesState,
              token.colorBgBase === "#000",
            );
          },
          lineNumbersMinChars: lineNumbersMinChars,
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
