import BasicLayout from '../layouts/BasicLayout.tsx'
import { useEffect, useMemo, useState } from 'react'
import { Form, Input, Select, Button, Card } from 'antd'
import CanyonReport from 'canyon-report'
import { useSearchParams } from 'react-router-dom'
import { useRequest } from 'ahooks'
import axios from 'axios'
import {useQuery} from "@apollo/client";
import {RepoDocument} from "@/helpers/backend/gen/graphql.ts";

const PlaygroundPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [form] = Form.useForm()

  const initialFormValues = useMemo(
    () => ({
      provider: searchParams.get('provider') ?? '',
      repoID: searchParams.get('repoID') ?? '',
      subject: searchParams.get('subject') ?? '',
      subjectID: searchParams.get('subjectID') ?? '',
      buildProvider: searchParams.get('buildProvider') ?? '',
      buildID: searchParams.get('buildID') ?? '',
      reportID: searchParams.get('reportID') ?? '',
      reportProvider: searchParams.get('reportProvider') ?? '',
      filePath: searchParams.get('filePath') ?? '',
      mode: searchParams.get('mode') ?? '',
    }),
    [searchParams],
  )

  const [queryVars, setQueryVars] = useState(() => ({
    repoID: searchParams.get('repoID') || '115474',
    sha:
      searchParams.get('subjectID') ||
      '145d37a694a2a93e44b2751510a19f5b82afac37',
    filepath:
      searchParams.get('filePath') || 'web/react-ui/overlay/placement.ts',
  }))

  useEffect(() => {
    form.setFieldsValue(initialFormValues)
    setQueryVars((prev) => ({
      ...prev,
      repoID: initialFormValues.repoID || prev.repoID,
      sha: initialFormValues.subjectID || prev.sha,
      filepath: initialFormValues.filePath || prev.filepath,
    }))
  }, [initialFormValues])

  // 这里的 queryVars 预留给需要联动请求的场景

  const onFinish = (values: any) => {
    const nextParams: Record<string, string> = {}
    Object.entries(values || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length > 0)
        nextParams[k] = String(v)
    })
    setSearchParams(nextParams)

    run(nextParams)

    setQueryVars((prev) => ({
      ...prev,
      repoID: values.repoID || prev.repoID,
      sha: values.subjectID || prev.sha,
      filepath: values.filePath || prev.filepath,
    }))
  }

  const { run, data } = useRequest(
    (p) =>
      axios
        .get(`/api/coverage/summary/map`, {
          params: p,
        })
        .then((res) => res.data),
    {
      manual: true,
    },
  )

  const {data:repoData} = useQuery(RepoDocument,{
    variables:{
      id: 'canyon-project/canyon'
    }
  })

  return (
    <BasicLayout>
      <Card className='p-4'>
        <Card className='mb-4'>
          <Form
            form={form}
            layout='vertical'
            onFinish={onFinish}
            className='grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3'
          >
            <Form.Item label='provider' name='provider'>
              <Input placeholder='provider' allowClear />
            </Form.Item>
            <Form.Item label='repoID' name='repoID'>
              <Input placeholder='repoID' allowClear />
            </Form.Item>
            <Form.Item label='subject' name='subject'>
              <Input placeholder='subject' allowClear />
            </Form.Item>
            <Form.Item label='subjectID' name='subjectID'>
              <Input placeholder='subjectID' allowClear />
            </Form.Item>
            <Form.Item label='buildProvider' name='buildProvider'>
              <Input placeholder='buildProvider' allowClear />
            </Form.Item>
            <Form.Item label='buildID' name='buildID'>
              <Input placeholder='buildID' allowClear />
            </Form.Item>
            <Form.Item label='reportID' name='reportID'>
              <Input placeholder='reportID' allowClear />
            </Form.Item>
            <Form.Item label='reportProvider' name='reportProvider'>
              <Input placeholder='reportProvider' allowClear />
            </Form.Item>
            <Form.Item label='filePath' name='filePath'>
              <Input placeholder='filePath' allowClear />
            </Form.Item>
            <Form.Item label='mode' name='mode'>
              <Select
                placeholder='模式'
                options={[
                  { label: '空', value: '' },
                  { label: 'blockMerge', value: 'blockMerge' },
                  { label: 'fileMerge', value: 'fileMerge' },
                ]}
                allowClear
              />
            </Form.Item>
            <div className='flex items-end'>
              <Button type='primary' htmlType='submit'>
                应用筛选
              </Button>
            </div>
          </Form>
        </Card>
        <CanyonReport name={repoData?.repo.pathWithNamespace.split('/')[1]} dataSource={data} />
        {/* 编辑器预览占位 */}
      </Card>
    </BasicLayout>
  )
}
export default PlaygroundPage
