import { FileOutlined, FolderFilled } from '@ant-design/icons';
import { ConfigProvider, Progress, Table } from 'antd';
import type { CoverageSummaryData } from 'istanbul-lib-coverage';
import type React from 'react';
import type { FC } from 'react';
import { getColor } from '../helpers/color';
// import { getColor } from "../helpers";

function checkSuffix(str: string) {
  console.log(str);
  return true;
}

const SummaryTree: FC<{
  dataSource: (CoverageSummaryData & { path: string })[];
  onSelect: (path: string) => void;
  style?: React.CSSProperties;
}> = ({ dataSource, onSelect, style }) => {
  const t = (res: string) => res;
  return (
    <div style={style}>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 0,
          },
        }}
      >
        <Table
          rowKey={'path'}
          bordered={true}
          pagination={false}
          size={'small'}
          dataSource={dataSource}
          columns={[
            {
              title: t('Files'),
              key: 'path',
              dataIndex: 'path',
              render(text) {
                return (
                  <a
                    style={{
                      display: 'flex',
                      gap: '10px',
                    }}
                    onClick={() => {
                      onSelect(text);
                    }}
                  >
                    {/\.(js|jsx|ts|tsx|vue)$/.test(text) && checkSuffix(text) ? (
                      <FileOutlined style={{ fontSize: '16px' }} />
                    ) : (
                      <FolderFilled style={{ fontSize: '16px' }} />
                    )}
                    {text.split('/').at(-1)}
                  </a>
                );
              },
            },
            {
              title: t('Total'),
              key: 'total',
              dataIndex: ['statements', 'total'],
              sorter(a, b) {
                return a.statements.total - b.statements.total;
              },
            },
            {
              title: t('Covered'),
              key: 'covered',
              dataIndex: ['statements', 'covered'],
              sorter(a, b) {
                return a.statements.covered - b.statements.covered;
              },
            },
            {
              title: `${t('Coverage')} %`,
              width: '300px',
              key: 'c',
              dataIndex: ['statements', 'pct'],
              sorter(a, b) {
                return a.statements.pct - b.statements.pct;
              },
              render(text) {
                return (
                  <Progress
                    percent={text}
                    strokeLinecap='butt'
                    size={'small'}
                    strokeColor={getColor(text)}
                    style={{
                      paddingRight: '5px',
                    }}
                    status={'normal'}
                  />
                );
              },
            },
          ]}
        />
      </ConfigProvider>
    </div>
  );
};

export default SummaryTree;
