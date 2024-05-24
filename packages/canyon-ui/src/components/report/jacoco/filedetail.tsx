import { Editor } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useEffect, useMemo, useRef, useState } from 'react';

import { annotateList } from './annotateList.ts';
// import { mock } from './mock.ts';
// import { mockCoverage } from './mockCoverage.ts';

const EditorJacoco = ({ sourcecode, filecoverage }) => {
  const [editor, setEditor] = useState<any>(false);
  const editorRef = useRef(null);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
    setEditor(editor);
  }
  const decorations = useMemo(() => {
    // console.log(annotateList)
    return annotateList(filecoverage).map((i) => {
      // console.log(cm)
      return {
        inlineClassName:
          (i.mb > 0 ? 'bfff' : false) ||
          (i.ci > 0 ? 'jacoco-content-class-found' : 'jacoco-content-class-no-found'),
        startLine: i.startLine,
        startCol: i.startCol,
        endLine: i.endLine,
        endCol: i.endCol,
      };
    });
  }, []);
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
    <Editor
      onMount={handleEditorDidMount}
      options={{
        // lineNumbers: 'off',
        readOnly: true,
        folding: false,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        showUnused: false,
        fontFamily: 'IBMPlexMono',
      }}
      height={'90vh'}
      value={sourcecode}
      language={'java'}
    />
  );
};

export default EditorJacoco;
