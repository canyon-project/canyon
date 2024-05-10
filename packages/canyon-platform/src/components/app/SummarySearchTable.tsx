import { SearchOutlined } from '@ant-design/icons';
import { InputRef, Progress, TableColumnsType, TableColumnType } from 'antd';
import { Button, Input, Space, Table } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import React, { useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { useSearchParams } from 'react-router-dom';
import { a } from 'vite/dist/node/types.d-aGj9QkWt';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

function getColor(text: any) {
  if (text > 80) {
    return '#52C41A';
  } else if (text > 60) {
    return '#1677ff';
  } else {
    return '#F5222D';
  }
}

type DataIndex = keyof DataType;

// const data: DataType[] = [
//   {
//     key: '1',
//     name: 'John Brown',
//     age: 32,
//     address: 'New York No. 1 Lake Park',
//   },
//   {
//     key: '2',
//     name: 'Joe Black',
//     age: 42,
//     address: 'London No. 1 Lake Park',
//   },
//   {
//     key: '3',
//     name: 'Jim Green',
//     age: 32,
//     address: 'Sydney No. 1 Lake Park',
//   },
//   {
//     key: '4',
//     name: 'Jim Red',
//     age: 32,
//     address: 'London No. 2 Lake Park',
//   },
// ];

const SummarySearchTable: React.FC = ({ data }) => {
  const [sprm] = useSearchParams();
  const currentPathname = location.pathname;
  // console.log(data,'data')
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type='primary'
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='small'
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size='small'
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type='link'
            size='small'
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type='link'
            size='small'
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) => {
      // console.log(path)

      // 假设你想要导航到 '/path' 并且拼接参数
      // const path1 = `/path`;
      const params = new URLSearchParams();
      if (sprm.get('report_id')) {
        params.append('report_id', sprm.get('report_id') || '');
      }
      if (sprm.get('mode')) {
        params.append('mode', sprm.get('mode') || '');
      }

      // params.append('mode', sprm.get('mode'));
      params.append('path', text);

      // 将参数拼接到路径中
      const pathWithParams = `${currentPathname}?${params.toString()}`;

      return (
        <a href={pathWithParams} target={'_blank'} className={'w-[240px] block'} rel='noreferrer'>
          {searchedColumn === dataIndex ? (
            <Highlighter
              highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
              searchWords={[searchText]}
              autoEscape
              textToHighlight={text ? text.toString() : ''}
            />
          ) : (
            text
          )}
        </a>
      );
    },
  });
  const obj = {
    s: {
      uppercase: 'Statements',
      lowercase: 'statements',
    },
    b: {
      uppercase: 'Branches',
      lowercase: 'branches',
    },
    f: {
      uppercase: 'Functions',
      lowercase: 'functions',
    },
    l: {
      uppercase: 'Lines',
      lowercase: 'lines',
    },
    nl: {
      uppercase: 'NewLines',
      lowercase: 'newlines',
    },
  };

  const columns: TableColumnsType<DataType> = [
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
      // width: '00px',
      // ellipsis: true,
      ...getColumnSearchProps('path'),
    },
    {
      title: 'Statements',
      dataIndex: ['statements', 'pct'],
      key: 'jindu',
      width: '30%',
      render(text) {
        return <Progress percent={text} showInfo={false} strokeColor={getColor(text)} />;
      },
      sorter: (a, b) => a.statements.pct - b.statements.pct,
      defaultSortOrder: 'descend',
    },
    ...['s', 'b', 'f', 'l', 'nl'].map((item) => {
      const lowercase = obj[item]['lowercase'];
      const uppercase = obj[item]['uppercase'];
      return {
        title: uppercase,
        // dataIndex: 'age',
        // key: 'age',
        children: [
          {
            title: 'P',
            dataIndex: [lowercase, 'pct'],
            key: lowercase + '.pct',
            render(text) {
              return <div style={{ color: getColor(text) }}>{text}</div>;
            },
            // sorter: true,
          },
          {
            title: 'R',
            key: lowercase + '.ratio',
            render(text: string, record: any) {
              return (
                // <div style={{height: '100%'}}>
                //   {record[lowercase]['covered']}/{record[lowercase]['total']}
                // </div>
                <div style={{ color: getColor(record[lowercase]['pct']) }}>
                  {record[lowercase]['covered']}/{record[lowercase]['total']}
                </div>
              );
            },
          },
        ],
      };
    }),
  ];

  return <Table columns={columns} dataSource={data} />;
};

export default SummarySearchTable;
