import { UsergroupAddOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';

import {
  ListUserDocument,
  UpdateProjectDocument,
} from '../../../../../../helpers/backend/gen/graphql.ts';
import CrudTable from './crud.tsx';
const { Text } = Typography;
const options = [
  {
    label: (
      <div className={'flex gap-1 flex-col'}>
        <Text>所有者</Text>
        <Text type={'secondary'} style={{ fontSize: '12px' }}>
          所有者可以编辑和删除项目、上报记录及团队成员。
        </Text>
      </div>
    ),
    value: 'owner',
  },
  {
    label: (
      <div className={'flex gap-1 flex-col'}>
        <Text>编辑者</Text>
        <Text type={'secondary'} style={{ fontSize: '12px' }}>
          编辑者可以编辑和删除项目、上报记录。
        </Text>
      </div>
    ),
    value: 'editor',
  },
  {
    label: (
      <div className={'flex gap-1 flex-col'}>
        <Text>查看者</Text>
        <Text type={'secondary'} style={{ fontSize: '12px' }}>
          查看者只可查看项目、上报记录。
        </Text>
      </div>
    ),
    value: 'viewer',
  },
];

const roleMap = {
  owner: '所有者',
  editor: '编辑者',
  viewer: '查看者',
};

// Filter `option.label` match the user type `input`
const filterOption = (input: string, option?: { label: string; value: string }) =>
  (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

const MemberTable = ({ members }) => {
  const columns = [
    {
      title: '成员',
      dataIndex: 'userID',
      key: 'userID',
      render: (text) => {
        const find = (userOptions?.listUser || []).find((i) => i.id === text);
        if (find){
          return `${find.nickname} <${find.email}>`;
        } else {
          return text;
        }
      },
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (text) => {
        return roleMap[text];
      },
    },
  ];

  // const dataSource = [];
  const [dataSource, setDataSource] = useState();

  useEffect(() => {
    setDataSource(members);
  }, [members]);

  const { data: userOptions } = useQuery(ListUserDocument);

  const [updateProject] = useMutation(UpdateProjectDocument);
  const prm = useParams();
  const onCreate = (v) => {
    setDataSource([
      ...dataSource,
      {
        ...v,
      },
    ]);
  };

  const onUpdate = (v) => {
    setDataSource(
      dataSource.map((i) => {
        if (i.userID === v.userID) {
          return v;
        }
        return i;
      }),
    );
  };

  const onDelete = ({ userID }) => {
    setDataSource(dataSource.filter((i) => i.userID !== userID));
  };

  const onSave = () => {
    updateProject({
      variables: {
        projectID: prm.id as string,
        members: dataSource.map(({ userID, role }) => ({
          userID,
          role,
        })),
      },
    }).then(res=>{
      message.success('保存成功');
    });
  };

  return (
    <div>
      <Card
        title={
          <div className={'flex items-center'}>
            <UsergroupAddOutlined className={'text-[#687076] mr-2 text-[16px]'} />
            <span>成员</span>
          </div>
        }
      >
        {/*{JSON.stringify(dataSource)}*/}
        <CrudTable
          columns={columns}
          dataSource={dataSource}
          loading={false}
          onCreate={onCreate}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onSave={onSave}
          formItems={(mode) => (
            <>

              <Form.Item label='成员' name='userID'>
                <Select
                  disabled={mode === 'update' ? true : false}
                  placeholder={'请选择成员'}
                  showSearch={true}
                  filterOption={filterOption}
                  options={(userOptions?.listUser || []).map(({ email, id, nickname }) => ({
                    label: `${nickname} <${email}>`,
                    value: id,
                  }))}
                />
              </Form.Item>

              <Form.Item label='角色' name='role'>
                <Select
                  options={options}
                  placeholder={'请选择角色'}
                  labelRender={({ value }) => {
                    return <Text>{roleMap[value]}</Text>;
                  }}
                />
              </Form.Item>

            </>
          )}
        />
      </Card>
    </div>
  );
};

export default MemberTable;
