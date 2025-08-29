import {
  Breadcrumb,
  Button,
  Divider,
  Input,
  Select,
  Space,
  Switch,
  Table,
  theme,
  Tooltip,
  Typography,
} from 'antd'
import {
  HeartFilled,
  HeartOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useRequest } from 'ahooks'
import axios from 'axios'
import { useEffect, useState } from 'react'
import BasicLayout from '@/layouts/BasicLayout.tsx'
import { useQuery } from '@apollo/client'
import { ReposDocument } from '@/helpers/backend/gen/graphql.ts'
const { Text } = Typography
const ProjectListPage = () => {
  const [keyword, setKeyword] = useState('')
  const { data, loading } = useQuery(ReposDocument, {
    variables: {
      keywords: '',
    },
  })

  const { t } = useTranslation()

  useEffect(() => {
    // run({ keyword });
  }, [])

  const columns: ColumnsType = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      // align:'center',
      render(text, record) {
        return (
          <Space>
            <div
              className={'favor-heart'}
              style={{
                visibility: record.favored ? 'unset' : undefined,
              }}
              onClick={() => {
                // favorProject({
                //   variables: {
                //     projectID: record.id,
                //     favored: !record.favored,
                //   },
                // }).then(() => {
                //   refetch().then(() => {
                //     message.success("success");
                //   });
                // });
              }}
            >
              {record.favored ? (
                <HeartFilled style={{ color: 'red' }} />
              ) : (
                <HeartOutlined />
              )}
            </div>
            {text}
          </Space>
        )
      },
    },
    // {
    //   title: t("projects.slug"),
    //   dataIndex: "id",
    //   key: "slug",
    //   render(text) {
    //     return (
    //       <span className={"max-w-[80px] block"}>{text.split("-")[2]}</span>
    //     );
    //   },
    // },
    {
      title: t('projects.name'),
      dataIndex: 'pathWithNamespace',
      key: 'pathWithNamespace',
      render: (text, record) => {
        return (
          <div className={'flex gap-1'}>
            <img
              src='/providers/gitlab.svg'
              alt=''
              className={'mt-1 w-[16px] h-[16px]'}
            />

            <span style={{ width: '4px', display: 'inline-block' }}></span>
            <div className={'flex gap-1 flex-col'}>
              <a
                className={'max-w-[240px]'}
                style={{ color: 'unset' }}
                target={'_blank'}
                rel='noreferrer'
              >
                {text}
              </a>
              <Text
                type={'secondary'}
                style={{ fontSize: '12px', width: '240px' }}
              >
                {record.description}
              </Text>
            </div>
          </div>
        )
      },
    },
    {
      title: 'Bu',
      dataIndex: 'bu',
      sorter: true,
    },
    {
      title: t('projects.report_times'),
      dataIndex: 'reportTimes',
      sorter: true,
    },
    {
      title: (
        <>
          <Tooltip
            title={t('projects.max_coverage_tooltip')}
            className={'!mr-2'}
          >
            <QuestionCircleOutlined />
          </Tooltip>
          最大覆盖率
        </>
      ),
      dataIndex: 'maxCoverage',
      key: 'maxCoverage',
      sorter: true,
      render: (text) => {
        return <Space>{text}</Space>
      },
    },
    {
      title: t('projects.latest_report_time'),
      dataIndex: 'lastReportTime',
      sorter: true,
      render(_) {
        return <span>{dayjs(_).format('MM-DD HH:mm')}</span>
      },
    },
    {
      title: t('common.option'),
      key: 'option',
      render: (_, { id, pathWithNamespace }) => {
        // Base64编码pathWithNamespace，处理包含斜杠的路径
        // const encodedPath = btoa(pathWithNamespace);
        return (
          <>
            <Link
              to={{
                pathname: `/gitlab/${pathWithNamespace}/commits`,
              }}
            >
              {t('common.detail')}
            </Link>
            <Divider type={'vertical'} />
            <Link
              to={{
                pathname: `/projects/${id}/settings`,
              }}
            >
              {t('common.settings')}
            </Link>
          </>
        )
      },
    },
  ]

  const { token } = theme.useToken()

  return (
    <BasicLayout>
      <div className={'h-[48px] flex items-center justify-between px-[16px]'}>
        <Breadcrumb
          items={[
            {
              title: 'Project',
              // href: '/projects',
            },
            // {
            //   title: 'xtaro-hotel-search',
            // },
          ]}
        />

        <Space>
          {/*<SettingOutlined />*/}
          <Button type={'primary'} size={'small'}>
            New Project
          </Button>
        </Space>
      </div>
      <Divider style={{ margin: '0' }} />
      <div className={'p-3'}>
        <div className={'flex justify-between'}>
          <div>
            <Select
              defaultValue={'fligt'}
              mode='multiple'
              onChange={(v) => {
                // setBu(v);
                localStorage.setItem('bu', JSON.stringify(v))
              }}
              placeholder={'Bu'}
              className={'w-[200px] !mr-2'}
              options={[]}
            />

            <Input.Search
              placeholder={t('projects.search_keywords')}
              className={'!w-[420px] mb-3'}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={() => {
                run({ keyword })
              }}
            />
            <Space className={'ml-5'}>
              <Text type={'secondary'}>{t('common.favor.only')}: </Text>
              <Switch
                checkedChildren={<HeartFilled />}
                defaultChecked={Boolean(
                  localStorage.getItem('favorOnlyFilter'),
                )}
                onChange={(v) => {
                  if (v) {
                    localStorage.setItem('favorOnlyFilter', '1')
                  } else {
                    localStorage.removeItem('favorOnlyFilter')
                  }
                  // setFavorOnly(v);
                }}
              />
            </Space>
          </div>
        </div>

        <div
          className={'overflow-hidden'}
          style={{
            border: `1px solid ${token.colorBorder}`,
            boxShadow: `${token.boxShadowTertiary}`,
            borderRadius: 2,
          }}
        >
          <Table
            loading={loading}
            columns={columns}
            dataSource={data?.repos.data || []}
          />
        </div>
      </div>
    </BasicLayout>
  )
}

export default ProjectListPage
