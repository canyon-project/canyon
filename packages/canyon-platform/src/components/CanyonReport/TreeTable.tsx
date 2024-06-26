import { FileOutlined, FolderFilled } from '@ant-design/icons';
import { ConfigProvider, Space } from 'antd';

import { getCOlor, percent } from '../../helpers/utils/common.ts';

const CanyonReportTreeTable = ({ dataSource, loading, activatedPath, onSelect, onlyChange }) => {
  const { t } = useTranslation();
  const newlinesColumns = onlyChange
    ? [
        {
          title: t('projects.newlines'),
          width: '200px',
          sorter: (a, b) => {
            return a.summary.newlines.pct - b.summary.newlines.pct;
          },
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
              title: t('projects.detail.files'),
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
              title: t('common.total'),
              key: 'total',
              dataIndex: ['summary', 'statements', 'total'],
              sorter(a, b) {
                return a.summary.statements.total - b.summary.statements.total;
              },
            },
            {
              title: t('common.covered'),
              key: 'covered',
              dataIndex: ['summary', 'statements', 'covered'],
              sorter(a, b) {
                return a.summary.statements.covered - b.summary.statements.covered;
              },
            },
          ]
            .concat(newlinesColumns)
            .concat([
              {
                title: t('projects.config.coverage') + ' %',
                width: '300px',
                key: 'c',
                dataIndex: ['summary', 'statements', 'pct'],
                sorter(a, b) {
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
