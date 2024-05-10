import Icon, { AppstoreOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { Editor } from '@monaco-editor/react';
import { useState } from 'react';
// import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import {
  GetProjectByIdDocument,
  UpdateProjectDocument,
} from '../../../../../helpers/backend/gen/graphql.ts';
import BasicForms from './helper/BasicForms.tsx';
import ConfigRule from './helper/ConfigRule.tsx';
import { SolarUserIdLinear } from './helper/icons/SolarUserIdLinear.tsx';
import TestTable from './helper/TestTable.tsx';

const gridStyle: any = {
  width: '100%',
};
const { Title, Text } = Typography;
const { useToken } = theme;
const ProjectConfigure = () => {
  const prm: any = useParams();
  const { token } = useToken();
  const { data: GetProjectByIdDocumentData } = useQuery(GetProjectByIdDocument, {
    variables: {
      projectID: prm.id,
    },
    fetchPolicy: 'no-cache',
  });
  const [updateProject] = useMutation(UpdateProjectDocument);
  // const { message } = App.useApp();
  const showMessage = () => {
    message.success('保存成功');
  };
  const [coverage, setCoverage] = useState<string>('');

  const [defaultBranch, setDefaultBranch] = useState<string>('');

  // const { t } = useTranslation();
  // const branchOptions = [];
  return (
    <div className={''}>
      <Title level={2} className={'flex items-center gap-3 pb-8'}>
        <AppstoreOutlined className={'text-[#687076] text-[32px]'} />
        <span>项目配置</span>
      </Title>
      <Card
        title={
          <div className={'flex items-center'}>
            <Icon component={SolarUserIdLinear} className={'text-[#687076] mr-2 text-[18px]'} />
            <span>基本信息</span>
          </div>
        }
      >
        <Card.Grid hoverable={false} style={gridStyle}>
          <BasicForms data={GetProjectByIdDocumentData?.getProjectByID} />
        </Card.Grid>
      </Card>
      <div className={'h-5'}></div>
      <TestTable tags={GetProjectByIdDocumentData?.getProjectByID.tags} />
      <div className={'h-5'}></div>
      <Card
        title={
          <div className={'flex items-center'}>
            <ExperimentOutlined className={'text-[#687076] mr-2 text-[16px]'} />
            <span>覆盖率</span>
          </div>
        }
      >
        <Card.Grid hoverable={false} style={gridStyle}>
          <div className={'mb-5'}>
            <div className={'mb-2'}>
              <div>默认分支</div>
              <Text className={'text-xs'} type={'secondary'}>
                默认分支作用于概览页面中覆盖率趋势图和表格。
              </Text>
            </div>
            {GetProjectByIdDocumentData && (
              <Select
                defaultValue={GetProjectByIdDocumentData?.getProjectByID.defaultBranch}
                placeholder={'请选择默认分支'}
                className={'w-[240px]'}
                showSearch={true}
                options={(GetProjectByIdDocumentData?.getProjectByID.branchOptions || []).map(
                  (item) => ({
                    label: item,
                    value: item,
                  }),
                )}
                onSelect={(value) => {
                  setDefaultBranch(value as string);
                }}
              />
            )}
          </div>

          <div className={'mb-5'}>
            <div className={'mb-2'}>
              <div>检测范围</div>
              <Text className={'text-xs'} type={'secondary'}>
                提示: 使用
                <a href='https://github.com/isaacs/minimatch' target={'_blank'} rel='noreferrer'>
                  minimatch
                </a>
                进行匹配，
                <a
                  href='https://github.com/canyon-project/canyon/tree/dev/examples/config/coverage.json'
                  target={'_blank'}
                  rel='noreferrer'
                >
                  查看示例
                </a>
                。
                配置include、exclude和extensions字段，include字段表示需要检测的文件，exclude字段表示不需要检测的文件，extensions字段表示需要检测的文件后缀。
              </Text>
            </div>
            <div style={{ border: '1px solid ' + token.colorBorder }}>
              {GetProjectByIdDocumentData?.getProjectByID && (
                <Editor
                  theme={
                    {
                      light: 'light',
                      dark: 'vs-dark',
                    }[localStorage.getItem('theme') || 'light']
                  }
                  defaultValue={GetProjectByIdDocumentData?.getProjectByID.coverage}
                  onChange={(value) => {
                    setCoverage(value || '');
                  }}
                  height={'240px'}
                  language={'json'}
                  options={{
                    minimap: {
                      enabled: false,
                    },
                    fontSize: 12,
                    wordWrap: 'wordWrapColumn',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                  }}
                />
              )}
            </div>
          </div>
          <Button
            type={'primary'}
            onClick={() => {
              try {
                // coverage用户输入了才检测
                if (coverage !== '') {
                  JSON.parse(coverage);
                }

                updateProject({
                  variables: {
                    projectID: prm.id,
                    coverage: coverage || GetProjectByIdDocumentData?.getProjectByID.coverage || '',
                    tag: '__null__',
                    description: '__null__',
                    defaultBranch:
                      defaultBranch ||
                      GetProjectByIdDocumentData?.getProjectByID.defaultBranch ||
                      '-',
                    rules: [],
                  },
                }).then(() => {
                  showMessage();
                });
              } catch (e) {
                message.error('Invalid JSON');
              }
            }}
          >
            保存更改
          </Button>
        </Card.Grid>
      </Card>
      <div className={'h-5'}></div>
    </div>
  );
};

export default ProjectConfigure;
