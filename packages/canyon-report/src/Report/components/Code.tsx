import hljs from 'highlight.js';
import { FC } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';

import { coreFn } from '../../helper.ts';
import Line from './Line.tsx';
import Mask from './Mask.tsx';

const Code: FC<{
  fileCoverage: any;
  fileContent: string;
  fileCodeChange: number[];
}> = ({ fileCoverage, fileContent, fileCodeChange }) => {
  const [renderMask, setRenderMask] = useState(false);
  const { lines } = coreFn(fileCoverage, fileContent);
  useEffect(() => {
    if (fileContent) {
      hljs.highlightAll();
      setRenderMask(true);
    }
  }, [fileContent]);
  return (
    <div>
      <div className={'box'}>
        {renderMask && <Mask code={fileContent} coverage={fileCoverage} />}
        <div style={{ display: 'flex' }}>
          <Line lines={lines} newlines={fileCodeChange || []} />
          <pre>
            <code
              style={{ fontSize: '14px', lineHeight: 1.5, display: 'block' }}
              className="language-typescript"
            >
              {fileContent}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Code;
