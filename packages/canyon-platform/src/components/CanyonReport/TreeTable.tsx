import { FileOutlined, FolderFilled } from '@ant-design/icons';
import { genSummaryTreeItem } from '@canyon/data';
import { ConfigProvider, Space } from 'antd';

import { getCOlor, percent } from '../../helpers/utils/common.ts';

const CanyonReportTreeTable = ({ dataSource, loading, activatedPath, onSelect, onlyChange }) => {
  const newlinesColumns = onlyChange
    ? [
        {
          title: 'New Lines Coverage',
          width: '200px',
          sorter: (a, b) => {
            return a.summary.newlines.pct - b.summary.newlines.pct;
          },
          // key: 'total',
          dataIndex: ['summary', 'newlines', 'total'],
          render(text, record) {
            return (
              <Space>
                <Progress
                  percent={record.summary.newlines.pct}
                  strokeLinecap='butt'
                  size={'small'}
                  style={{ width: '100px' }}
                  strokeColor={getCOlor(record.summary.newlines.pct)}
                  className={'pr-5'}
                  status={'normal'}
                />
                <span style={{ fontSize: '10px' }}>
                  ({record.summary.newlines.covered}/{record.summary.newlines.total})
                </span>
                {/*{record.summary.newlines.covered}%*/}
              </Space>
            );
          },
        },
        // {
        //   title: 'covered',
        //   key: 'covered',
        //   dataIndex: ['summary', 'newlines', 'covered'],
        // },
      ]
    : [];
  // const newlinesColumns = [];
  return (
    <div>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 0,
          },
        }}
      >
        <Table
          loading={loading}
          bordered={true}
          pagination={false}
          size={'small'}
          // children={false}
          dataSource={dataSource}
          // onRow={(record, rowIndex) => {
          //   return {
          //     onClick: (event) => {
          //       console.log(record);
          //       onSelect(record);
          //     }, // click row
          //   };
          // }}
          columns={[
            {
              title: 'Files',
              key: 'path',
              dataIndex: 'path',
              render(text, record) {
                return (
                  <a
                    className={'flex gap-1'}
                    onClick={() => {
                      onSelect(record);
                    }}
                  >
                    {text.includes('.') ? (
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
              title: 'Total',
              key: 'total',
              dataIndex: ['summary', 'statements', 'total'],
            },
            {
              title: 'Covered',
              key: 'covered',
              dataIndex: ['summary', 'statements', 'covered'],
            },
          ]
            .concat(newlinesColumns)
            .concat([
              {
                title: 'Coverage %',
                width: '300px',
                key: 'c',
                dataIndex: ['summary', 'statements', 'pct'],
                sorter(a,b){
                  return a.summary.statements.pct - b.summary.statements.pct;
                },
                render(text) {
                  return (
                    <Progress
                      percent={text}
                      strokeLinecap='butt'
                      size={'small'}
                      strokeColor={getCOlor(text)}
                      className={'pr-5'}
                      status={'normal'}
                    />
                  );
                },
              },
            ])}
        />
      </ConfigProvider>
    </div>
  );
};

export default CanyonReportTreeTable;
