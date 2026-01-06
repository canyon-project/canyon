import { ConfigProvider, Progress, Table } from 'antd';
import type { CoverageSummaryData } from 'istanbul-lib-coverage';
import type { CSSProperties, FC } from 'react';
import Highlighter from 'react-highlight-words';
import { getColor } from '../helpers/color';

// import TextHighlight from "../components/TextHighlight";

const t = (msg: string) => msg;
const SummaryList: FC<{
  dataSource: (CoverageSummaryData & { path: string })[];
  onSelect: (path: string) => void;
  filenameKeywords: string;
  style?: CSSProperties;
  onlyChange: boolean;
}> = ({ dataSource, onSelect, filenameKeywords, style, onlyChange }) => {
  const columns = [
    {
      title: t('Files'),
      key: 'path',
      dataIndex: 'path',
      render(text) {
        return (
          <a
            onClick={() => {
              onSelect(text);
            }}
          >
            <Highlighter
              highlightClassName='YourHighlightClass'
              searchWords={[filenameKeywords]}
              autoEscape={true}
              textToHighlight={text}
            />
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
      title: t('Change Statements'),
      key: 'changestatements',
      dataIndex: ['changestatements'],
      width: '220px',
      render(_) {
        _ = _ || {
          pct: 100,
          total: 0,
          covered: 0,
        };
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Progress
              percent={_.pct}
              strokeLinecap='butt'
              size={'small'}
              strokeColor={getColor(_.pct)}
              style={{
                width: '100px',
                paddingRight: '5px',
                fontSize: '10px',
              }}
              status={'normal'}
            />
            <span
              style={{
                fontSize: '10px',
              }}
            >
              ({`${_.covered}/${_.total}`})
            </span>
          </div>
        );
      },
    },
    {
      title: `${t('Coverage')} %`,
      width: '240px',
      key: 'c',
      sorter: (a, b) => {
        return a.statements.pct - b.statements.pct;
      },
      dataIndex: ['statements', 'pct'],
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
  ].filter(
    (c) =>
      c.key !== 'changestatements' ||
      (c.key === 'changestatements' && onlyChange),
  );
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
          bordered={true}
          pagination={{
            defaultPageSize: 15,
          }}
          size={'small'}
          dataSource={dataSource}
          rowKey={'path'}
          columns={columns}
        />
      </ConfigProvider>
    </div>
  );
};

export default SummaryList;
