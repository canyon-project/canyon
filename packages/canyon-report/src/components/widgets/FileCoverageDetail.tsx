import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";

import * as monaco from "monaco-editor";
import { annotateFunctions, annotateStatements } from "../helpers/annotate.ts";
import LineNumber from "./line/number.tsx";
import LineNew from "./line/new.tsx";
import LineCoverage from "./line/coverage.tsx";
import {coreFn} from "../helpers/coreFn.ts";

const FileCoverageDetail: FC<{
  fileContent: string;
  fileCodeChange: number[];
  fileCoverage: any;
}> = ({ fileContent, fileCoverage,fileCodeChange }) => {
  const lineCount = fileContent.split("\n").length;
  const {lines} = coreFn(fileCoverage, fileContent);
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

      // 禁用 Monaco 内部的 Command + F 或 Ctrl + F
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
        // 不做任何操作，事件会继续传播到浏览器
        console.log("Command + F");
      });
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
      <LineNumber theme={"light"} count={fileContent.split("\n").length} />
      <LineNew
        count={fileContent.split("\n").length}
        news={fileCodeChange}
      ></LineNew>
      <LineCoverage
        theme={"light"}
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

      <Editor
        value={fileContent}
        // theme={"nightOwl"}
        height={`${18 * lineCount}px`}
        language={"javascript"}
        onMount={handleEditorDidMount}
        options={{
          lineHeight: 18,
          lineNumbers: "off",
          readOnly: true,
          folding: false,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          showUnused: false,
          fontSize: 12,
          fontFamily: "IBMPlexMono",
          scrollbar: {
            handleMouseWheel: false,
          },
          contextmenu: false,
        }}
      />
    </div>
  );
};

export default FileCoverageDetail;
