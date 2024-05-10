import { ExperimentOutlined, FileAddFilled, PlusOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { Editor } from '@monaco-editor/react';
import { Button, ConfigProvider, Space } from 'antd';
import { useParams } from 'react-router-dom';

import { UpdateProjectDocument } from '../../../../../../helpers/backend/gen/graphql.ts';
const gridStyle: any = {
  width: '100%',
};

const ConfigRule = ({ rules }) => {
  const [activedName, setActivedName] = useState('');
  const [dataSource, setDataSource] = useState(JSON.parse(JSON.stringify(rules || [])));

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: '编辑',
      dataIndex: 'address',
      key: 'address',
      render(text, record) {
        return (
          <a
            onClick={() => {
              setActivedName(record.name);
            }}
          >
            编辑
          </a>
        );
      },
    },
  ];

  return (
    <div>
      <Card
        title={
          <div className={'flex items-center'}>
            <ExperimentOutlined className={'text-[#687076] mr-2 text-[16px]'} />
            <span>规则</span>
          </div>
        }
      >
        <Card.Grid hoverable={false} style={gridStyle}>
          <ConfigProvider
            theme={{
              token: {
                // borderRadius: 0,
              },
            }}
          >
            <Table
              rowKey={(record) => record.name}
              pagination={false}
              // size={'small'}
              bordered={true}
              columns={columns}
              dataSource={dataSource}
              expandable={{
                expandedRowKeys: [activedName],
                onExpand: (expanded, record) => {
                  if (expanded === false) {
                    setActivedName('');
                  } else {
                    setActivedName(record.name);
                  }
                },
                expandedRowRender: (record) => (
                  <Editor
                    value={record.config}
                    height={100}
                    language={'javascript'}
                    onChange={(val) => {
                      // se
                      const d = JSON.parse(JSON.stringify(dataSource));
                      d.find((i) => i.name === activedName).config = val || '';
                      setDataSource(d);
                    }}
                  />
                ),
                rowExpandable: (record) => record.name !== 'Not Expandable',
              }}
            />
          </ConfigProvider>
          <div className={'h-5'}></div>
          <Space>
            <Button
              type={'primary'}
              onClick={() => {
                console.log(dataSource);
              }}
            >
              保存更改
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                setDataSource([
                  ...dataSource,
                  {
                    name: 'test',
                    config: '',
                    updatedAt: new Date(),
                  },
                ]);
              }}
            >
              新增
            </Button>
          </Space>
        </Card.Grid>
      </Card>
    </div>
  );
};

export default ConfigRule;
