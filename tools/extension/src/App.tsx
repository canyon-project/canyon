import {
  CheckCircleOutlined,
  DownloadOutlined,
  GithubOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Button, ConfigProvider, Input, message, Space, Tooltip } from 'antd';
import { useState } from 'react';
import './index.css';

interface ProjectData {
  projectId: string;
  commitSha: string;
  branch: string;
  dsn: string;
  coverage: number;
  intervalReport: number;
  reportId: string;
  reporter: string;
  reporterEmail: string;
}

function App() {
  const [data, setData] = useState<ProjectData>({
    projectId: '140539',
    commitSha: '6206109404e5ee32c7b2b59eb2f66af83f3ad687',
    branch: 'dev',
    dsn: 'https://canyontest.com/coverage/client',
    coverage: 9,
    intervalReport: 7,
    reportId: 'sfasfasfa',
    reporter: 'xxxx',
    reporterEmail: 'xxx@xxx.com',
  });

  const [result, setResult] = useState<string>('');

  const handleUpload = () => {
    message.success('上传成功');
    setResult('上传操作已完成');
  };

  const handleRefresh = () => {
    message.info('刷新中...');
    // 这里可以添加刷新逻辑
    setResult('数据已刷新');
  };

  const handleDownloadCoverage = () => {
    message.info('正在下载覆盖率数据...');
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0071c2',
        },
      }}
    >
      <div className='min-h-screen bg-white'>
        {/* Header */}
        <header className='bg-[#0071c2] text-white px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <img src='/logo-128.png' alt='Canyon' className='w-8 h-8' />
            <span className='text-xl font-semibold'>Canyon</span>
          </div>
          <a
            href='https://github.com/canyon-project/canyon'
            target='_blank'
            rel='noopener noreferrer'
            className='text-white hover:opacity-80'
          >
            <GithubOutlined className='text-2xl' />
          </a>
        </header>

        {/* Main Content */}
        <main className='max-w-4xl mx-auto px-6 py-8'>
          {/* Data Section */}
          <section className='mb-8'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-1 h-8 bg-[#0071c2]'></div>
              <h2 className='text-xl font-semibold text-gray-800'>Data</h2>
            </div>
            <div className='bg-white border border-gray-200 rounded-lg p-6 space-y-4'>
              {/* Project ID */}
              <div className='flex items-center'>
                <span className='w-32 text-gray-600 font-medium'>
                  Project ID:
                </span>
                <span className='text-gray-900'>{data.projectId}</span>
              </div>

              {/* Commit Sha */}
              <div className='flex items-center'>
                <span className='w-32 text-gray-600 font-medium'>
                  Commit Sha:
                </span>
                <span className='text-gray-900 font-mono text-sm'>
                  {data.commitSha}
                </span>
              </div>

              {/* Branch */}
              <div className='flex items-center'>
                <span className='w-32 text-gray-600 font-medium'>Branch:</span>
                <span className='text-gray-900'>{data.branch}</span>
              </div>

              {/* DSN */}
              <div className='flex items-center'>
                <span className='w-32 text-gray-600 font-medium'>DSN:</span>
                <span className='text-gray-900 text-sm'>{data.dsn}</span>
              </div>

              {/* Coverage */}
              <div className='flex items-center'>
                <span className='w-32 text-gray-600 font-medium'>
                  Coverage:
                </span>
                <Space>
                  <a
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      handleDownloadCoverage();
                    }}
                    className='text-[#0071c2] hover:underline'
                  >
                    {data.coverage}
                  </a>
                  <DownloadOutlined className='text-gray-500 cursor-pointer hover:text-[#0071c2]' />
                </Space>
              </div>

              {/* Interval Report */}
              <div className='flex items-center'>
                <span className='w-32 text-gray-600 font-medium flex items-center gap-1'>
                  Interval Report:
                  <Tooltip title='报告间隔时间（秒）'>
                    <QuestionCircleOutlined className='text-gray-400 cursor-help' />
                  </Tooltip>
                </span>
                <Input
                  type='number'
                  value={data.intervalReport}
                  onChange={(e) =>
                    setData({ ...data, intervalReport: Number(e.target.value) })
                  }
                  className='w-24'
                  suffix='s'
                />
              </div>

              {/* Report ID */}
              <div className='flex items-center'>
                <span className='w-32 text-gray-600 font-medium flex items-center gap-1'>
                  Report ID:
                  <Tooltip title='报告标识符'>
                    <QuestionCircleOutlined className='text-gray-400 cursor-help' />
                  </Tooltip>
                </span>
                <Input
                  value={data.reportId}
                  onChange={(e) =>
                    setData({ ...data, reportId: e.target.value })
                  }
                  className='flex-1 max-w-md'
                />
              </div>

              {/* Reporter */}
              <div className='flex items-center'>
                <span className='w-32 text-gray-600 font-medium'>
                  Reporter:
                </span>
                <Space className='flex-1'>
                  <Input
                    value={data.reporter}
                    onChange={(e) =>
                      setData({ ...data, reporter: e.target.value })
                    }
                    className='flex-1 max-w-md'
                  />
                  <span className='text-gray-600'>{data.reporterEmail}</span>
                  <CheckCircleOutlined className='text-green-500 text-lg' />
                </Space>
              </div>
            </div>
          </section>

          {/* Action Section */}
          <section className='mb-8'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-1 h-8 bg-[#0071c2]'></div>
              <h2 className='text-xl font-semibold text-gray-800'>Action</h2>
            </div>
            <div className='bg-white border border-gray-200 rounded-lg p-6'>
              <Space>
                <Button type='primary' size='large' onClick={handleUpload}>
                  Upload
                </Button>
                <Button size='large' onClick={handleRefresh}>
                  Refresh
                </Button>
              </Space>
            </div>
          </section>

          {/* Result Section */}
          <section>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-1 h-8 bg-[#0071c2]'></div>
              <h2 className='text-xl font-semibold text-gray-800'>Result</h2>
            </div>
            <div className='bg-white border border-gray-200 rounded-lg p-6 min-h-[200px]'>
              {result ? (
                <div className='text-gray-700'>{result}</div>
              ) : (
                <div className='text-gray-400'>暂无结果</div>
              )}
            </div>
          </section>
        </main>
      </div>
    </ConfigProvider>
  );
}

export default App;
