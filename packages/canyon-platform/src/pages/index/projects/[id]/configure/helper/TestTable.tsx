import { ExperimentOutlined, PlusOutlined, TagOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { createId } from '@paralleldrive/cuid2';
import { Button, Divider, Drawer, Space, Table, Tag } from 'antd';
import { ColorPicker, theme } from 'antd';
import { useParams } from 'react-router-dom';

import { UpdateProjectDocument } from '../../../../../../helpers/backend/gen/graphql.ts';
type FieldType = {
  id?: string;
  name?: string;
  link?: string;
  color?: string;
};

const gridStyle: any = {
  width: '100%',
};
function setDByeky(key, item, list) {
  const newList = JSON.parse(JSON.stringify(list));

  const f = newList.findIndex((i) => i.id === key);
  if (f > -1) {
    newList[f] = {
      ...item,
    };
  } else {
    console.log('什么也不做');
  }
  return newList;
}

const CanyonColorPicker = ({ value, onChange }) => {
  return (
    <div>
      <ColorPicker
        showText
        disabledAlpha
        value={value}
        onChange={(color, hex) => {
          onChange(hex);
        }}
      />
    </div>
  );
};

const TestTable = ({ tags }) => {
  const [activeID, setActiveID] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    if (tags !== undefined) {
      setDataSource(
        tags.map(({ id, name, link, color }) => ({
          id,
          name,
          link,
          color,
        })),
      );
    }
  }, [tags]);
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render(text) {
        return <span className={'block w-[100px]'}>{text}</span>;
      },
    },
    {
      title: t('projects.config.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('projects.config.link'),
      dataIndex: 'link',
      key: 'link',
      width: '300px',
      render(text) {
        return (
          <a
            href={text}
            target='_blank'
            className={'w-[200px] block'}
            style={{ textWrap: 'wrap' }}
            rel='noreferrer'
          >
            {text}
          </a>
        );
      },
    },
    {
      title: t('projects.config.color'),
      dataIndex: 'color',
      key: 'color',
      render(text, record) {
        return <Tag color={text}>{record.name}</Tag>;
      },
    },
    {
      title: t('common.option'),
      render(text, record) {
        return (
          <>
            <a
              onClick={() => {
                setActiveID(record.id);
                setOpen(true);
              }}
            >
              {t('common.edit')}
            </a>

            <Divider type={'vertical'} />
            <a
              className={'text-red-500 hover:text-red-500'}
              onClick={() => {
                setDataSource(dataSource.filter((i) => i.id !== record.id));
              }}
            >
              {t('common.delete')}
            </a>
          </>
        );
      },
    },
  ];

  function onFinish(values) {
    console.log(values);
    setDataSource(setDByeky(activeID, values, dataSource));
  }

  const [form] = Form.useForm();
  const [updateProject] = useMutation(UpdateProjectDocument);
  const prm = useParams();

  useEffect(() => {
    form.setFieldsValue(dataSource.find((i) => i.id === activeID));
  }, [activeID]);

  return (
    <div>
      <Card
        title={
          <div className={'flex items-center'}>
            <TagOutlined className={'text-[#687076] mr-2 text-[16px]'} />
            <span>{t('projects.config.tag')}</span>
          </div>
        }
      >
        <Card.Grid hoverable={false} style={gridStyle}>
          <Table
            dataSource={dataSource}
            columns={columns}
            bordered={true}
            pagination={false}
            size={'small'}
          />
          <div className={'h-5'}></div>
          <Space>
            <Button
              type={'primary'}
              onClick={() => {
                updateProject({
                  variables: {
                    projectID: prm.id as string,
                    coverage: '__null__',
                    tag: '__null__',
                    description: '__null__',
                    defaultBranch: '__null__',
                    tags: dataSource,
                  },
                }).then((r) => {
                  message.success('保存成功');
                });
              }}
            >
              {t('projects.config.save.changes')}
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                setDataSource(
                  dataSource.concat({
                    id: createId(),
                    name: 'tagname',
                    link: '',
                    color: '#0071c2',
                  }),
                );
              }}
            >
              {t('common.add')}
            </Button>
          </Space>
        </Card.Grid>
      </Card>

      <Drawer
        title={t('projects.config.edit.tag')}
        destroyOnClose={true}
        width={'35%'}
        open={open}
        onClose={() => {
          setOpen(false);
          form.submit();
        }}
      >
        <Form
          form={form}
          name='basic'
          layout={'vertical'}
          // initialValues={dataSource.find((i) => {
          //   return i.id === activeID;
          // })}
          onFinish={onFinish}
        >
          <Form.Item<FieldType> label='ID' name='id'>
            <Input disabled />
          </Form.Item>

          <Form.Item<FieldType> label={t('projects.config.name')} name='name'>
            <Input />
          </Form.Item>

          <Form.Item<FieldType> label={t('projects.config.link')} name='link'>
            <Input placeholder={t('projects.config.link.placeholder')} />
          </Form.Item>

          <Form.Item<FieldType> label={t('projects.config.color')} name='color'>
            <CanyonColorPicker />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default TestTable;
