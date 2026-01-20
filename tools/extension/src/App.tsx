import {
  CheckCircleOutlined,
  DownloadOutlined,
  GithubOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {Button, ConfigProvider, Divider, Input, message, Space, Tooltip} from 'antd';
import { useState } from 'react';
import './index.css';
import { getCoverageAndCanyonData, upload } from './helper.ts';
import AppFooter from "./components/app/footer.tsx";

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
    getCoverageAndCanyonData('rid').then((res) => {
      upload(res);
      message.success('上传成功');
      setResult('上传操作已完成');
    });
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
          colorPrimary: '#3264ff',
        },
      }}
    >
      <div className='w-[500px]'>
        {/* Header */}
        <header className='bg-[#3264ff] text-white px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <img src='/logo-128.png' alt='Canyon' className='w-8 h-8' />
            <span className='text-xl font-semibold'>Canyon</span>
          </div>
          <a
            href='https://github.com/canyon-project/canyon'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:opacity-80'
            style={{
              color:'white'
            }}
          >
            <GithubOutlined className='text-2xl' />
          </a>
        </header>

        {/* Main Content */}
        <main className='px-6 pt-4'>
          {/* Data Section */}
          <section className='mb-8'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-1 h-4 bg-[#3264ff]'></div>
              <h2 className=' font-semibold text-gray-800'>Data</h2>
            </div>
            <div className=''>
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
                    className='text-[#3264ff] hover:underline'
                  >
                    {data.coverage}
                  </a>
                  <DownloadOutlined className='text-gray-500 cursor-pointer hover:text-[#3264ff]' />
                </Space>
              </div>
            </div>
          </section>
          <Divider/>
          {/* Action Section */}
          <section className='mb-8'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-1 h-4 bg-[#3264ff]'></div>
              <h2 className='font-semibold text-gray-800'>Action</h2>
            </div>
            <div className='flex justify-between gap-3'>
              <Button className={'w-full'} type='primary' onClick={handleUpload}>
                Upload
              </Button>
              <Button className={'w-full'} onClick={handleRefresh}>
                Refresh
              </Button>
            </div>
          </section>

          {/* Result Section */}
          <section>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-1 h-4 bg-[#3264ff]'></div>
              <h2 className='font-semibold text-gray-800'>Result</h2>
            </div>
            <div className='bg-white border border-gray-200 rounded-lg p-6 min-h-[200px]'>
              {result ? (
                <div className='text-gray-700'>{result}</div>
              ) : (
                <div className='text-gray-400'>暂无结果</div>
              )}
            </div>
          </section>
          <Divider/>
        </main>

        <div className={'px-6 mb-4'}>
          <a style={{
            fontSize:'12px',
            textDecoration:'underline',
          }} href="">Something wrong or missing?</a>
        </div>
        <AppFooter/>
      </div>
    </ConfigProvider>
  );
}

export default App;
