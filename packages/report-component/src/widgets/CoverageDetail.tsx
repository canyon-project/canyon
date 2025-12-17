import { useEffect, useRef } from 'react';

function CanyonReport({
  fileContent,
  fileCoverage,
  fileCodeChange,
}: {
  fileContent: string;
  fileCoverage: any;
  fileCodeChange: any;
}) {
  // 使用 fileCodeChange 避免未使用参数警告
  console.log({ fileCodeChange, fileCoverage }, 'coverage data');
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      const dom = ref.current;
      const options = {
        value: fileContent,
        language: 'javascript',
        fontFamily: 'IBMPlexMono',
      };

      if (window.monaco?.editor && dom) {
        // 如果已经加载，直接创建编辑器
        // @ts-expect-error
        const _editor = window.monaco.editor.create(dom, options);
      }
    }
  }, [fileContent]);
  return (
    <div>
      <div ref={ref} style={{ height: 'calc(100vh - 150px)' }} />
    </div>
  );
}

export default CanyonReport;
