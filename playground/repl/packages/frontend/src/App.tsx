import {useMemo, useState} from 'react'
import './App.css'
import { useRequest } from 'ahooks'
import axios from 'axios'
import { Editor } from '@monaco-editor/react'
import { Button, Space, Tabs, message, Typography, Segmented, Tag, Card } from 'antd'
import { PlayCircleOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import FileCoverageDetail from "@/components/CoverageDetail.tsx";

function App() {
  const [inputCode, setInputCode] = useState<string>('const x: number = 42')
  const [outputCode, setOutputCode] = useState<string>('')
  const [logsText, setLogsText] = useState<string>('')
  const [language, setLanguage] = useState<'typescript' | 'javascript'>('typescript')
  const [pluginsJson, setPluginsJson] = useState<string>(JSON.stringify([["istanbul"]], null, 2))

  const currentFilename = language === 'typescript' ? 'input.ts' : 'input.js'

  const [messageApi, contextHolder] = message.useMessage()

  const {data,run,loading} = useRequest(
    (payload: { code: string; filename: string; plugins: unknown }) => {
      return axios
        .post('/api/transform', {
          code: payload.code,
          filename: payload.filename,
          plugins: payload.plugins,
        })
        .then((r) => r.data)
    },
    {
      manual: true,
      onSuccess: (res) => {
        const nextCode = res?.code ?? ''
        setOutputCode(nextCode)
        const logs = res?.logs ?? []
        try {
          setLogsText(JSON.stringify(logs, null, 2))
        } catch (e) {
          setLogsText(String(logs))
        }
      },
    }
  )

    const cov = useMemo(() => {
        // console.log(data.logs[0][0],'transformRequest.data')
        try {
            return data.logs[0][0]
        } catch (e) {
            return {}
        }
    },[data])

  const onTransform = () => {
    let parsedPlugins: unknown = []
    try {
      parsedPlugins = JSON.parse(pluginsJson || '[]')
    } catch (e) {
      messageApi.error('插件配置 JSON 解析失败')
      return
    }
    run({ code: inputCode, filename: currentFilename, plugins: parsedPlugins })
  }

  const onCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(outputCode || '')
      messageApi.success('已复制输出代码')
    } catch (e) {
      messageApi.error('复制失败')
    }
  }

  const onCopyLogs = async () => {
    try {
      await navigator.clipboard.writeText(logsText || '')
      messageApi.success('已复制日志')
    } catch (e) {
      messageApi.error('复制失败')
    }
  }

  const onClear = () => {
    setOutputCode('')
    setLogsText('')
  }

  const tabItems = [
    {
      key: 'code',
      label: '输出代码',
      children: (
        <Card size="small" title="输出代码" extra={<Space><Button icon={<DeleteOutlined />} onClick={onClear}>清空</Button><Button icon={<CopyOutlined />} onClick={onCopyOutput} disabled={!outputCode}>复制</Button></Space>}>
          <Editor
            value={outputCode}
            language="javascript"
            height="100vh"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontFamily: 'IBMPlexMono, monospace',
              fontSize: 14,
              scrollBeyondLastLine: false,
            }}
          />
        </Card>
      ),
    },
    {
      key: 'logs',
      label: '日志',
      children: (
        <Card size="small" title="日志" extra={<Button icon={<CopyOutlined />} onClick={onCopyLogs} disabled={!logsText}>复制</Button>}>
          <Editor
            value={logsText}
            language="json"
            height="100vh"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontFamily: 'IBMPlexMono, monospace',
              fontSize: 14,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </Card>
      ),
    },
      {
          key: 'report',
            label: '覆盖率报告',
          children: (
            <Card size="small" title="覆盖率报告">
              <div style={{height: '100vh', width:'100%'}}>
                {cov && outputCode ? (
                  <FileCoverageDetail fileCoverage={cov['/Users/travzhang/Desktop/babel-test/input.ts']} fileContent={inputCode} fileCodeChange={[]} theme={"light"} />
                ) : (
                  <Typography.Text type="secondary">暂无数据，请先转换。</Typography.Text>
                )}
              </div>
            </Card>
          )
      }
  ]

  return (
    <div className="p-4">
      {contextHolder}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <Card className="col-span-1 md:col-span-3" size="small" title="插件配置（JSON）" extra={<Button size="small" onClick={() => setPluginsJson(JSON.stringify([["istanbul"]], null, 2))}>重置</Button>}>
          <Editor
            value={pluginsJson}
            onChange={(v) => setPluginsJson(v || '')}
            language="json"
            path="plugins.json"
            height="100vh"
            options={{
              minimap: { enabled: false },
              fontFamily: 'IBMPlexMono, monospace',
              fontSize: 13,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
            }}
          />
        </Card>
        <div className="col-span-1 md:col-span-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Typography.Text>
                输入代码（{language === 'typescript' ? 'TypeScript' : 'JavaScript'}）
              </Typography.Text>
              <Tag color="blue">{currentFilename}</Tag>
            </div>
            <Space>
              <Segmented
                options={[
                  { label: 'TypeScript', value: 'typescript' },
                  { label: 'JavaScript', value: 'javascript' },
                ]}
                value={language}
                onChange={(val) => setLanguage(val as 'typescript' | 'javascript')}
              />
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={loading}
                onClick={onTransform}
              >
                转换
              </Button>
            </Space>
          </div>
          <Editor
            value={inputCode}
            onChange={(v) => setInputCode(v || '')}
            language={language}
            path={currentFilename}
            height="100vh"
            options={{
              minimap: { enabled: false },
              fontFamily: 'IBMPlexMono, monospace',
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        <Card className="col-span-1 md:col-span-5" size="small" title="结果">
          <Tabs items={tabItems} />
        </Card>

      </div>
    </div>
  )
}

export default App
