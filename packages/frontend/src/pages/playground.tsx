import BasicLayout from '../layouts/BasicLayout.tsx'
import {useEffect, useMemo, useRef, useState} from 'react'
import { Form, Input, Select, Button, Card } from 'antd'
import CanyonReport from 'canyon-report'
import { useSearchParams } from 'react-router-dom'
import { useRequest } from 'ahooks'
import axios from 'axios'
import {useQuery} from "@apollo/client";
import { RepoDocument} from "@/helpers/backend/gen/graphql.ts";
import { handleSelectFileBySubject } from '@/helpers/report.ts'


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

  const hasAutoRanRef = useRef(false)

  useEffect(() => {
    form.setFieldsValue(initialFormValues)
  }, [initialFormValues])

  const onFinish = (values: any) => {
    const nextParams: Record<string, string> = {}
    Object.entries(values || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length > 0)
        nextParams[k] = String(v)
    })
    setSearchParams(nextParams)

    run(nextParams)
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

  const [activatedPath, setActivatedPath] = useState<string | undefined>('');

  type SubjectType = 'commit' | 'commits' | 'pull' | 'pulls' | 'multiple-commits' | 'multi-commits'
  const isSubjectType = (s: string): s is SubjectType =>
    ['commit', 'commits', 'pull', 'pulls', 'multiple-commits', 'multi-commits'].includes(s as any)

  function onSelect(val: string) {
    setActivatedPath(val);
    if (!val.includes('.')) {
      return Promise.resolve({ fileContent: '', fileCoverage: {}, fileCodeChange: [] });
    }

    const {
      repoID: repoIdFromUrl,
      subject,
      subjectID,
      provider,
      buildProvider,
      buildID,
      reportProvider,
      reportID,
    } = initialFormValues;

    const repoID = repoIdFromUrl || (repoData?.repo?.id ?? '');

    if (!repoID || !subject || !subjectID || !isSubjectType(subject)) {
      return Promise.resolve({ fileContent: '', fileCoverage: {}, fileCodeChange: [] });
    }

    return handleSelectFileBySubject({
      repoID,
      subject,
      subjectID,
      filepath: val,
      provider: provider || undefined,
      buildProvider: buildProvider || undefined,
      buildID: buildID || undefined,
      reportProvider: reportProvider || undefined,
      reportID: reportID || undefined,
    }).then((res) => {
      console.log(res)
      return {
        fileContent: res.fileContent,
        fileCoverage: res.fileCoverage,
        fileCodeChange: res.fileCodeChange,
      }
    });
  }

  // 首次进入且必要参数齐全时自动请求
  useEffect(() => {
    if (hasAutoRanRef.current) return
    const { subject, subjectID, provider, repoID, buildProvider, buildID } = initialFormValues
    const required = [subject, subjectID, provider, repoID, buildProvider, buildID]
    if (required.every((v) => v && String(v).length > 0)) {
      hasAutoRanRef.current = true
      const nextParams: Record<string, string> = {}
      Object.entries(initialFormValues || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).length > 0) nextParams[k] = String(v)
      })
      run(nextParams)
    }
  }, [initialFormValues, run])

  const {data:repoData} = useQuery(RepoDocument,{
    variables:{
      id: 'canyon-project/canyon'
    }
  })

  // const {data:codeFileContentData} = useQuery(CodeFileContentDocument,{
  //   variables:{
  //     repoID:'1',
  //     filepath:'f',
  //     sha:'df'
  //   }
  // })

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
        <div className={'h-[500px]'}>
          <CanyonReport value={activatedPath} name={repoData?.repo.pathWithNamespace.split('/')[1]} dataSource={data} onSelect={onSelect} />
        </div>
        {/* 编辑器预览占位 */}
      </Card>
    </BasicLayout>
  )
}
export default PlaygroundPage
