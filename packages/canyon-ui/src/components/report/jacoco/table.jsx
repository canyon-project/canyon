import Icon from '@ant-design/icons';
import { Progress, Space, Table } from 'antd';

import { EmojionePackage } from './icons/EmojionePackage.tsx';
import JavaClass from './icons/JavaClass.tsx';
import JavaMethod from './icons/JavaMethod.tsx';
export function getCOlor(num) {
  if (num >= 80) {
    return 'rgb(33,181,119)';
  } else if (num >= 50) {
    return 'rgb(244,176,27)';
  } else {
    return 'rgb(245,32,32)';
  }
}
function percent(covered, total) {
  let tmp;
  if (total > 0) {
    tmp = (1000 * 100 * covered) / total;
    return Math.floor(tmp / 10) / 100;
  } else {
    return 100.0;
  }
}
function removeQuestionMark(str) {
  if (str.charAt(0) === '.') {
    return str.substring(1);
  } else {
    return str;
  }
}
const JacocoTable = ({ dataSource, selectedKey, onSelect, items }) => {
  const columns = [
    {
      title: 'Element',
      dataIndex: 'name',
      render(text, record) {
        return (
          <Space>
            {items.length === 0 && <Icon component={EmojionePackage} />}

            {items.length === 1 && <Icon component={JavaClass} />}

            {items.length === 2 && <Icon component={JavaMethod} />}

            <a
              onClick={() => {
                console.log(record, items);
                if ((record, items.length >= 2)) {
                  console.log(record, items.length);
                  // items.at(-1).path + record.line
                  onSelect(items.at(-1).path + '#L' + record.line);
                } else {
                  onSelect(record.name);
                }
              }}
            >
              {removeQuestionMark(text.replaceAll(selectedKey, '').replaceAll('/', '.'))}
            </a>
          </Space>
        );
      },
    },
    {
      title: 'Missed Instructions',
      render(text, record) {
        // console.log(record)
        const x = record.counter.find((item) => item['type'] === 'INSTRUCTION');
        if (!x) {
          return <div>kong</div>;
        }
        const missed = x['missed'];
        const covered = x['covered'];
        return (
          <div>
            <Progress
              strokeLinecap='butt'
              percent={percent(covered, covered + missed)}
              size={'small'}
              style={{ width: '200px' }}
              strokeColor={getCOlor(percent(covered, covered + missed))}
              className={'pr-5'}
              status={'normal'}
            />
          </div>
        );
      },
    },
    {
      title: 'Missed Branches',
      dataIndex: 'atomicNumber',
      render(text, record) {
        let missed = 0;
        let covered = 0;
        const x = record.counter.find((item) => item['type'] === 'BRANCH');

        if (x) {
          missed = x['missed'];
          covered = x['covered'];
        }
        return (
          <div>
            <Progress
              strokeLinecap='butt'
              percent={percent(covered, covered + missed)}
              size={'small'}
              style={{ width: '200px' }}
              strokeColor={getCOlor(percent(covered, covered + missed))}
              className={'pr-5'}
              status={'normal'}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        pagination={false}
        rowKey={'name'}
        dataSource={
          dataSource
          // coverage.package
          //   .find((item) => {
          //     console.log(item.name, activePackage);
          //     return item.name === activePackage;
          //   })
          //   .class.find((item) => {
          //     return item.name === activeClass;
          //   }).method
        }
        columns={columns}
        size={'small'}
        bordered={true}
      />
    </div>
  );
};

export default JacocoTable;
