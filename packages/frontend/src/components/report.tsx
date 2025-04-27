import { Editor } from '@monaco-editor/react';
import mock from '../mock';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { getDecode } from '@/helper';



const Report = () => {
  const [editor, setEditor] = useState<any>(false);
  const editorRef = useRef(null);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
    setEditor(editor);
  }
  const decorations = useMemo(() => {
    return [
      {
        inlineClassName: 'coverage-if',
        startLine: 20,
        startCol: 3,
        endLine: 20,
        endCol: 5,
      },
    ];
  }, []);

  useEffect(() => {
    if (editor) {
      editor?.deltaDecorations?.(
        [],
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
    <div>
      <Editor
        onMount={handleEditorDidMount}
        options={{
          lineHeight: 18,
          readOnly: true,
          folding: false,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          showUnused: false,
          fontSize: 12,
          scrollbar: {
            // handleMouseWheel: false,
          },
          contextmenu: false,
        }}
        value={getDecode(mock.content)}
        height={'100vh'}
        language={'javascript'}
      />
    </div>
  );
};

export default Report;
