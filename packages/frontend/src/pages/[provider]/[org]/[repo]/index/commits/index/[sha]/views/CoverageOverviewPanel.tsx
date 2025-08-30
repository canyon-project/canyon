import { Button, Collapse, Progress, Space, Table } from 'antd';
import { Bot, ClipboardList } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { CoverageOverviewPanelProps } from '@/types';

// moved columns inside component to use navigation handlers

const CoverageOverviewPanel: React.FC<CoverageOverviewPanelProps> = ({
  build,
}) => {
  const [searchParams, _setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams();
  type ModeItem = {
    mode: 'auto' | 'manual';
    summary?: { covered?: number; total?: number };
    caseList?: Array<Record<string, any>>;
  };
  const automatedMode = (build?.modeList || []).find(
    (r: ModeItem) => r.mode === 'auto',
  ) as ModeItem | undefined;
  const manualMode = (build?.modeList || []).find(
    (r: ModeItem) => r.mode === 'manual',
  ) as ModeItem | undefined;
  const calcPercent = (covered?: number, total?: number) => {
    if (!total || total <= 0 || !covered || covered < 0) return 0;
    const val = (covered / total) * 100;
    return Number.isFinite(val) ? Number(val.toFixed(1)) : 0;
  };
  const getStrokeColor = (percent: number) =>
    percent >= 80
      ? 'green'
      : percent >= 60
        ? 'blue'
        : percent >= 40
          ? 'orange'
          : 'red';
  function getToFilePath() {
    navigate(
      `/${params.provider}/${params.org}/${params.repo}/commits/${params.sha}/-/?build_provider=${searchParams.get('build_provider')}&build_id=${searchParams.get('build_id')}`,
    );
  }
  const openReportDetail = ({
    reportProvider,
    reportID,
  }: {
    reportProvider: string;
    reportID?: string;
  }) => {
    const base = `/${params.provider}/${params.org}/${params.repo}/commits/${params.sha}/-/`;
    const qp = new URLSearchParams(searchParams);
    qp.set('report_provider', reportProvider);
    if (reportID) qp.set('report_id', reportID);
    navigate(`${base}?${qp.toString()}`);
  };
  const openFirstReportForMode = (mode: 'auto' | 'manual') => {
    const modeItem = (build?.modeList || []).find(
      (r: ModeItem) => r.mode === mode,
    ) as ModeItem | undefined;
    // 模式级别：只附带 report_provider，不附带 report_id
    const firstCase =
      modeItem?.caseList && modeItem.caseList.length > 0
        ? modeItem.caseList[0]
        : undefined;
    const reportProvider =
      mode === 'manual' ? 'person' : firstCase?.reportProvider || 'mpaas';
    openReportDetail({ reportProvider });
  };

  const getColumnsForMode = (mode: 'auto' | 'manual') => [
    {
      title: 'Report ID',
      dataIndex: 'reportID',
      key: 'reportID',
      render: (
        _: string,
        record: { reportProvider?: string; reportID?: string },
      ) => (
        <Button
          type='link'
          size='small'
          onClick={() =>
            openReportDetail({
              reportProvider:
                record.reportProvider ||
                (mode === 'manual' ? 'person' : 'mpaas'),
              reportID: record.reportID,
            })
          }
        >
          {record.reportID}
        </Button>
      ),
    },
    {
      title: 'Case Name',
      dataIndex: 'caseName',
      key: 'caseName',
      render(_: string, _c: { caseUrl?: string; reportProvider?: string }) {
        return (
          <>
            {_c.caseUrl ? (
              <a
                className={'flex items-center gap-1'}
                href={_c.caseUrl}
                target={'_blank'}
              >
                <img
                  className={'h-[12px]'}
                  src={`/providers/${_c.reportProvider}.svg`}
                  alt=''
                />
                <span>{_}</span>
              </a>
            ) : (
              <span>{_}</span>
            )}
          </>
        );
      },
    },
    {
      title: 'Pass Rate',
      key: 'passRate',
      dataIndex: 'passRate',
      width: 200,
    },
    {
      title: 'Case Count',
      key: 'passRate',
      width: 200,
      render: (
        _: unknown,
        record: { passedCount: number; failedCount: number },
      ) => {
        const total = record.passedCount + record.failedCount;
        return (
          <span>
            <span className='font-medium text-green-600'>
              {record.passedCount}
            </span>{' '}
            / {total}
          </span>
        );
      },
    },
    {
      title: 'Coverage',
      dataIndex: 'summary',
      key: 'summary',
      render: (_: { percent: number }) => _.percent,
    },
  ];

  return (
    <div className=''>
      {/*<CoverageDetail open={coverageDetailOpen} />*/}
      <div className='mb-4 flex items-center justify-between rounded-lg p-4'>
        <div className='flex items-center space-x-6'>
          <div className='flex items-center space-x-2'>
            <span className='font-medium'>Overall Coverage:</span>
            <Progress
              percent={calcPercent(
                build?.summary?.covered,
                build?.summary?.total,
              )}
              size='small'
              strokeColor={getStrokeColor(
                calcPercent(build?.summary?.covered, build?.summary?.total),
              )}
              style={{ width: '100px' }}
            />
            <Button
              className='ml-2'
              type={'primary'}
              size={'small'}
              onClick={() => {
                getToFilePath();
              }}
            >
              查看
            </Button>
          </div>
        </div>
      </div>
      {/*{JSON.stringify(build.modeList||[])}*/}
      {build.modeList && (
        <Collapse defaultActiveKey={['manual', 'automated']}>
          <Collapse.Panel
            key='automated'
            header={
              <div className='flex w-full items-center pr-8'>
                <Space className='font-medium'>
                  <Bot size={16} />
                  Automated Test Coverage
                  <Progress
                    percent={calcPercent(
                      automatedMode?.summary?.covered,
                      automatedMode?.summary?.total,
                    )}
                    size='small'
                    strokeColor={getStrokeColor(
                      calcPercent(
                        automatedMode?.summary?.covered,
                        automatedMode?.summary?.total,
                      ),
                    )}
                    style={{ width: '100px' }}
                  />
                </Space>
                <Button
                  className='ml-2'
                  size='small'
                  onClick={() => openFirstReportForMode('auto')}
                >
                  查看
                </Button>
              </div>
            }
            className='border-0'
          >
            {build.modeList
              .filter((r: any) => r.mode === 'auto')
              .map((report: any) => (
                <div key={report.reportID} className='mb-4'>
                  <Table
                    columns={getColumnsForMode('auto')}
                    dataSource={report.caseList}
                    rowKey='caseId'
                    size='small'
                    className='border border-gray-200 '
                    style={{
                      borderBottom: 0,
                    }}
                  />
                </div>
              ))}
          </Collapse.Panel>
          <Collapse.Panel
            key='manual'
            header={
              <div className='flex w-full items-center pr-8'>
                <Space className='font-medium'>
                  <ClipboardList size={16} />
                  Manual Test Coverage
                  <Progress
                    percent={calcPercent(
                      manualMode?.summary?.covered,
                      manualMode?.summary?.total,
                    )}
                    size='small'
                    strokeColor={getStrokeColor(
                      calcPercent(
                        manualMode?.summary?.covered,
                        manualMode?.summary?.total,
                      ),
                    )}
                    style={{ width: '100px' }}
                  />
                </Space>
                <Button
                  className='ml-2'
                  size='small'
                  onClick={() => openFirstReportForMode('manual')}
                >
                  查看
                </Button>
              </div>
            }
            className='border-0'
          >
            {build.modeList
              ?.filter((r: any) => r.mode === 'manual')
              .map((report: any) => (
                <div key={report.reportID} className='mb-4'>
                  {/*{JSON.stringify(report.caseList||[])}*/}
                  <Table
                    columns={getColumnsForMode('manual')}
                    dataSource={report.caseList}
                    rowKey='caseId'
                    size='small'
                    className='border border-gray-200'
                    style={{
                      borderBottom: 0,
                    }}
                  />
                </div>
              ))}
          </Collapse.Panel>
        </Collapse>
      )}
    </div>
  );
};

export default CoverageOverviewPanel;
