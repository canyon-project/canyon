import {useState} from 'react'
import {useRequest} from 'ahooks'
import axios from 'axios'
import {Editor} from '@monaco-editor/react'
import {Button, ConfigProvider, Divider, message, Segmented, Space, Tabs, Tag, Typography} from 'antd'
import {PlayCircleOutlined} from '@ant-design/icons'
import FileCoverageDetail from "@/components/CoverageDetail.tsx";
import {code} from './data/code'

function App() {
  const [inputCode, setInputCode] = useState<string>(code)
  const [outputCode, setOutputCode] = useState<string>('')
  const [logsText, setLogsText] = useState<string>('')
  const [language, setLanguage] = useState<'typescript' | 'javascript'>('typescript')
  const [pluginsJson] = useState<string>(JSON.stringify([["istanbul"]], null, 2))
  const [reRender, setReRender] = useState<boolean>(true)

  const currentFilename = language === 'typescript' ? 'input.ts' : 'input.js'

  const [messageApi, contextHolder] = message.useMessage()

  const {data, run, loading} = useRequest(
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
        // Force re-mount right panel to refresh UI
        setReRender(false)
        setTimeout(() => setReRender(true), 100)
      },
    }
  )


  const onTransform = () => {
    let parsedPlugins: unknown = []
    try {
      parsedPlugins = JSON.parse(pluginsJson || '[]')
    } catch (e) {
      messageApi.error('插件配置 JSON 解析失败')
      return
    }
    run({code: inputCode, filename: currentFilename, plugins: parsedPlugins})
  }


  const tabItems = [
    {
      key: 'code',
      label: '输出代码',
      children: (
        <div className={'border border-gray-200'}>
          <Editor
            value={outputCode}
            language="javascript"
            height="calc(100vh - 100px)"
            options={{
              readOnly: true,
              minimap: {enabled: false},
              fontFamily: 'IBMPlexMono, monospace',
              fontSize: 12,
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      ),
    },
    {
      key: 'logs',
      label: '日志',
      children: (
        <div className={'border border-gray-200'}>
          <Editor
            value={logsText}
            language="json"
            height="calc(100vh - 100px)"
            options={{
              readOnly: true,
              minimap: {enabled: false},
              fontFamily: 'IBMPlexMono, monospace',
              fontSize: 12,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </div>
      ),
    },
    {
      key: 'report',
      label: '覆盖率报告',
      children: (
        <div className={'border border-gray-200'}>
          <div style={{height: 'calc(100vh - 100px)', width: '100%'}}>
            {(outputCode&&reRender) ? (
              <FileCoverageDetail fileCoverage={data.coverage} fileContent={inputCode} fileCodeChange={[]}
                                  theme={"light"}/>
            ) : (
              <div className={'p-2'}>
                <Typography.Text type="secondary">暂无数据，请先转换。</Typography.Text>
              </div>
            )}
          </div>
        </div>
      )
    }
  ]

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0071c2',
          borderRadius: 2,
        },
      }}>
      {contextHolder}
      <div className="flex gap-2 p-2">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-[20px]">
            <div className="flex items-center gap-2">
              <Typography.Text>
                输入代码（{language === 'typescript' ? 'TypeScript' : 'JavaScript'}）
              </Typography.Text>
              <Tag color="blue">{currentFilename}</Tag>
            </div>
            <Space>
              <Segmented
                options={[
                  {label: 'TypeScript', value: 'typescript'},
                  {label: 'JavaScript', value: 'javascript'},
                ]}
                value={language}
                onChange={(val) => setLanguage(val as 'typescript' | 'javascript')}
              />
              <Button
                type="primary"
                icon={<PlayCircleOutlined/>}
                loading={loading}
                onClick={onTransform}
              >
                转换
              </Button>
            </Space>
          </div>
          <div className={'border border-gray-200'}>
            <Editor
              value={inputCode}
              onChange={(v) => setInputCode(v || '')}
              language={language}
              path={currentFilename}
              height="calc(100vh - 100px)"
              options={{
                minimap: {enabled: false},
                fontFamily: 'IBMPlexMono, monospace',
                fontSize: 12,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
        <Divider type={'vertical'} style={{
          height: 'calc(100vh - 32px)',
        }}/>
        <div className={'flex-1'}>
          <Tabs size={'small'} items={tabItems}/>
        </div>

      </div>
    </ConfigProvider>
  )
}

export default App
