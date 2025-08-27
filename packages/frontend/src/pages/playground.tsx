import BasicLayout from '../layouts/BasicLayout.tsx'
import {useQuery} from "@apollo/client";
import {CodeFileContentDocument} from "../helpers/backend/gen/graphql.ts";
import { getDecode } from '../helpers/code.ts';
import {Editor} from "@monaco-editor/react";
import {useState} from 'react'
import { Form, Input, Select, Button, Card } from 'antd'

const PlaygroundPage = () => {
  const [queryVars, setQueryVars] = useState({
    repoID: "115474",
    sha: "145d37a694a2a93e44b2751510a19f5b82afac37",
    filepath: "web/react-ui/overlay/placement.ts"
  })

  const {data} = useQuery(CodeFileContentDocument,{
    variables: queryVars
  })

  const onFinish = (values: any) => {
    setQueryVars(prev => ({
      ...prev,
      repoID: values.repoID || prev.repoID,
      filepath: values.filePath || prev.filepath,
    }))
  }

  return <BasicLayout>
    <div className="p-4">
      <Card className="mb-4">
        <Form layout="vertical" onFinish={onFinish} className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
          <Form.Item label="provider" name="provider">
            <Input placeholder="provider" allowClear />
          </Form.Item>
          <Form.Item label="repoID" name="repoID">
            <Input placeholder="repoID" allowClear />
          </Form.Item>
          <Form.Item label="subject" name="subject">
            <Input placeholder="subject" allowClear />
          </Form.Item>
          <Form.Item label="subjectID" name="subjectID">
            <Input placeholder="subjectID" allowClear />
          </Form.Item>
          <Form.Item label="buildProvider" name="buildProvider">
            <Input placeholder="buildProvider" allowClear />
          </Form.Item>
          <Form.Item label="buildID" name="buildID">
            <Input placeholder="buildID" allowClear />
          </Form.Item>
          <Form.Item label="reportID" name="reportID">
            <Input placeholder="reportID" allowClear />
          </Form.Item>
          <Form.Item label="reportProvider" name="reportProvider">
            <Input placeholder="reportProvider" allowClear />
          </Form.Item>
          <Form.Item label="filePath" name="filePath">
            <Input placeholder="filePath" allowClear />
          </Form.Item>
          <Form.Item label="mode" name="mode">
            <Select
              placeholder="模式"
              options={[
                { label: '空', value: '' },
                { label: 'blockMerge', value: 'blockMerge' },
                { label: 'fileMerge', value: 'fileMerge' },
              ]}
              allowClear
            />
          </Form.Item>
          <div className="flex items-end">
            <Button type="primary" htmlType="submit">应用筛选</Button>
          </div>
        </Form>
      </Card>
      <Editor value={getDecode(data?.codeFileContent?.content||'')} height="500px" language={'javascript'} />
    </div>
  </BasicLayout>
}
export default PlaygroundPage
