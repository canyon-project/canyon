import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";

import * as monaco from "monaco-editor";

export function annotateStatements(fileCoverage: any) {
  const annotateStatementsList: any[] = [];
  const statementStats = fileCoverage.s;
  const statementMeta = fileCoverage.statementMap;
  Object.entries(statementStats).forEach(([stName, count]: any) => {
    const meta = statementMeta[stName];
    const type = count > 0 ? "yes" : "no";
    const startCol = meta.start.column;
    const endCol = meta.end.column + 1;
    const startLine = meta.start.line;
    const endLine = meta.end.line;
    if (type === "no") {
      annotateStatementsList.push({
        startLine,
        endLine,
        startCol,
        endCol,
        type,
      });
    }
  });
  return annotateStatementsList;
}

export function annotateFunctions(fileCoverage, structuredText) {
  const fnStats = fileCoverage.f;
  const fnMeta = fileCoverage.fnMap;
  if (!fnStats) {
    return [];
  }
  const list = [];
  Object.entries(fnStats).forEach(([fName, count]) => {
    const meta = fnMeta[fName];
    const type = count > 0 ? "yes" : "no";
    // Some versions of the instrumenter in the wild populate 'func'
    // but not 'decl':
    const decl = meta.decl || meta.loc;
    const startCol = decl.start.column;
    let endCol = decl.end.column + 1;
    const startLine = decl.start.line;
    const endLine = decl.end.line;
    if (type === "no") {
      if (endLine !== startLine) {
        console.log("???????");
        endCol = structuredText[startLine - 1].length;
      }
      list.push({
        startLine,
        endLine,
        startCol,
        endCol,
        type,
      });
    }
  });
  return list;
}

const FileCoverageDetail: FC<{
  fileContent: string;
  lines: { count: number }[];
  fileCoverage: any;
}> = ({ fileContent, lines, fileCoverage }) => {
  const lineCount = fileContent.split("\n").length;

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
    <div>
      <Editor
        value={fileContent}
        // theme={"nightOwl"}
        height={`${18 * lineCount}px`}
        language={"javascript"}
        onMount={handleEditorDidMount}
        // value={value}
        options={{
          lineHeight: 18,
          // lineNumbers: "off",
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
          // mouseWheelScrollSensitivity: 0, // 设置为 0 禁用编辑器的滚动行为
          // mouseWheelZoom: false, // 禁止鼠标滚轮缩放
          // handleMouseWheel
        }}
      />
    </div>
  );
};

export default FileCoverageDetail;
