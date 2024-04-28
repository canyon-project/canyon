import { CopyOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Button } from 'antd';
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSearchParams } from 'react-router-dom';

import { getCOlor } from '../../helpers/utils/common.ts';
import { capitalizeFirstLetter } from './helper.tsx';
const obj = {
  statements: 0,
  branches: 1,
  functions: 2,
  lines: 3,
  newlines: 4,
};
const { Text } = Typography;
const CanyonReportOverview = ({ activatedPath, pathWithNamespace, onSelect, summaryTreeItem }) => {
  const [sprm] = useSearchParams();

  return (
    <div>
      {/*<span>{JSON.stringify(summaryTreeItem.summary)}</span>*/}
      <div className={'mb-2'} style={{ fontSize: '20px', fontWeight: 'bold' }}>
        <a
          className={'cursor-pointer'}
          onClick={() => {
            onSelect({ path: '' });
          }}
        >
          {pathWithNamespace}
        </a>
        {/*<span> / </span>*/}
        {activatedPath?.split('/').map((i, index, arr) => {
          return (
            <>
              {activatedPath !== '' ? <span> / </span> : null}
              <a
                className={'cursor-pointer'}
                onClick={() => {
                  const newpath = arr
                    .filter((i, index3) => index3 < index + 1)
                    .reduce((c, p, index) => {
                      return c + (index === 0 ? '' : '/') + p;
                    }, '');
                  onSelect({ path: newpath });
                }}
              >
                {i.replace('~', pathWithNamespace)}
              </a>
            </>
          );
        })}
        <CopyToClipboard text={location.href} onCopy={()=>{
          message.success('Copy Success')
        }}>
          <a className={'cursor-pointer ml-2'}>
            <ShareAltOutlined style={{ fontSize: '16px', fontWeight: 'bold' }} />
          </a>
        </CopyToClipboard>
      </div>

      <div className={'flex gap-3 mb-3'}>
        {Object.entries(summaryTreeItem.summary)
          .sort((a, b) => {
            return obj[a[0]] - obj[b[0]];
          })
          .map(([key, value]) => {
            return (
              <div className={'flex gap-1 items-center'}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{value.pct}%</span>
                <Text style={{ fontSize: '14px' }} type={'secondary'}>
                  {capitalizeFirstLetter(key)}
                </Text>
                <Tag bordered={false}>
                  {value.covered}/{value.total}
                </Tag>
              </div>
            );
          })}
      </div>
      <div
        style={{
          backgroundColor: getCOlor(summaryTreeItem.summary.statements.pct),
        }}
        className={'w-full h-[10px] mb-3'}
      ></div>
    </div>
  );
};

export default CanyonReportOverview;
