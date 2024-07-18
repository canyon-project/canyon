import 'highlight.js/styles/atom-one-dark.css';
import './CopyCode.css';

import { CopyOutlined } from '@ant-design/icons';
import hljs from 'highlight.js';
import { FC, useEffect } from 'react';
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard';

const CopyCode: FC<{ code: string }> = ({ code }) => {
  const fileContent = code;
  useEffect(() => {
    if (fileContent) {
      hljs.highlightAll();
    }
  }, [fileContent]);
  return (
    <div className={'relative copy-code '}>
      <div className={'absolute right-[10px] top-[10px]'}>
        <CopyToClipboard text={code}>
          <Button type={'link'} className={'btn hidden'} icon={<CopyOutlined />} />
        </CopyToClipboard>
      </div>
      <pre className={'rounded-lg overflow-hidden'}>
        <code style={{ fontSize: '14px', lineHeight: 1.5 }} className='language-typescript'>
          {fileContent}
        </code>
      </pre>
    </div>
  );
};

export default CopyCode;
