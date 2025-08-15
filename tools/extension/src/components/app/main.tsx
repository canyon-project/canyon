import {
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { css } from '@emotion/react';
import { useRequest } from 'ahooks';
import { Alert, Button, Input, InputNumber, Modal, Space, Spin, Tag, Tooltip } from 'antd';
import { useMemo, useState } from 'react';

import { checkUser, downJson, getCoverageAndCanyonData, upload } from '../../helper.ts';
import AppDataLayout from './data/layout.tsx';
import AppResult from './result.tsx';
import AppRow from './row.tsx';

const AppMain = () => {
  const [coverages, setCoverages] = useState<any>([]);
  const [reportID, setReportID] = useState('');
  const [reporter, setReporter] = useState('');
  const [intervalTime, setIntervalTime] = useState(0);
  const {
    data: uploadData,
    loading: uploadLoading,
    refresh: uploadRefresh,
    error: uploadError,
  } = useRequest(
    () =>
      upload({
        canyon: {
          ...canyon,
          reportID: reportID || undefined,
          reporter: reporter || canyon.reporter || undefined,
        },
        coverage,
      }),
    {
      manual: true,
      onSuccess() {},
    },
  );
  const {
    data: { canyon, coverage } = {
      canyon: {
        sha: '-',
        projectID: '-',
        branch: '-',
        dsn: '-',
        reporter: '-',
        instrumentCwd: '-',
        buildID: '-',
        buildProvider: '-',
      },
      coverage: {},
    },
    loading,
    refresh,
    run,
    error: error,
  } = useRequest(
    (
      { _reportID, _intervalTime, _reporter } = { _reportID: undefined, __intervalTime: undefined },
    ) => {
      return getCoverageAndCanyonData(_reportID, _intervalTime, _reporter);
    },
    {
      onSuccess(res: any) {
        setCoverages([coverages.length > 0 ? coverages[1] : null, res.coverage]);
        setReportID(res.canyon.reportID);
        setReporter(res.canyon.reporter);
        if (res.canyon.intervalTime) {
          setIntervalTime(Number(res.canyon.intervalTime));
        }
      },
      onError(err) {
        errorAlert(err);
      },
    },
  );
  const { data: checkUserData } = useRequest(
    () =>
      checkUser({
        canyon: {
          ...canyon,
          reportID: reportID || undefined,
          reporter: reporter || canyon.reporter || undefined,
        },
      }),
    {
      refreshDeps: [canyon.reporter, canyon.dsn, reporter],
    },
  );

  const isnew = useMemo(() => {
    return JSON.stringify(coverages[0]) !== JSON.stringify(coverages[1]);
  }, [coverages]);
  const errorAlert = (e: any) => {
    Modal.error({
      title: String(e),
    });
  };
  return (
    <div
      css={css`
        padding: 20px;
      `}
    >
      {error && (
        <Alert
          css={css`
            margin-bottom: 20px;
          `}
          type={'error'}
          message={`${error}`}
          showIcon
        />
      )}
      <AppRow title={'Data'}>
        <Spin spinning={loading}>
          <Space direction={'vertical'}>
            <AppDataLayout label={'Project ID'} value={canyon.projectID} />
            <AppDataLayout label={'Commit Sha'} value={canyon.sha} />
            <AppDataLayout label={'Branch'} value={canyon.branch} />
            <AppDataLayout label={'DSN'} value={canyon.dsn} />
            <AppDataLayout
              label={'Coverage'}
              value={
                <div>
                  <a
                    onClick={() => {
                      downJson(JSON.stringify(coverage), canyon.projectID + '-' + canyon.sha);
                    }}
                  >
                    {Object.keys(coverage).length}
                    <DownloadOutlined
                      css={css`
                        margin-left: 8px;
                      `}
                    />
                  </a>{' '}
                  {isnew && coverages[0] ? (
                    <Tooltip title={'has new'}>
                      <Tag
                        css={css`
                          margin-left: 8px;
                          cursor: default;
                        `}
                        color={'success'}
                      >
                        New
                      </Tag>
                    </Tooltip>
                  ) : null}
                </div>
              }
            />
            <AppDataLayout
              label={
                <>
                  Interval Report
                  <Tooltip title={'Set interval time to report at intervals, 0 is closed.'}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </>
              }
              value={
                <Space>
                  <InputNumber
                    max={60}
                    min={0}
                    value={intervalTime}
                    onChange={(e) => {
                      setIntervalTime(e || 0);
                    }}
                    onBlur={() => {
                      run({
                        _intervalTime: intervalTime,
                        _reportID: undefined,
                        _reporter: undefined,
                      });
                    }}
                    style={{ width: '265px' }}
                    placeholder={'The interval time range is 0-60'}
                  />
                  <span>s</span>
                </Space>
              }
            />
            <AppDataLayout
              label={
                <>
                  Report ID
                  <Tooltip title={'Coverage data for the same report id can be aggregated'}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </>
              }
              value={
                <Input
                  maxLength={64}
                  value={reportID}
                  onChange={(e) => {
                    setReportID(e.target.value);
                  }}
                  onBlur={() => {
                    run({
                      _intervalTime: undefined,
                      _reportID: reportID,
                      _reporter: undefined,
                    });
                  }}
                  style={{ width: '320px' }}
                  placeholder={'The default value is Commit Sha'}
                />
              }
            />

            <AppDataLayout
              label={<>Reporter</>}
              value={
                <Space>
                  <Input
                    value={reporter}
                    onChange={(e) => {
                      setReporter(e.target.value);
                    }}
                    style={{ width: '220px' }}
                    placeholder={'Reporter'}
                    onBlur={() => {
                      run({
                        _intervalTime: undefined,
                        _reportID: undefined,
                        _reporter: reporter,
                      });
                    }}
                  />

                  <span>{checkUserData?.email}</span>
                  {checkUserData?.email ? (
                    <CheckOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <Tooltip title={'Invalid Token'}>
                      <CloseOutlined style={{ color: 'red', cursor: 'pointer' }} />
                    </Tooltip>
                  )}
                </Space>
              }
            />
          </Space>
        </Spin>
      </AppRow>
      <AppRow title={'Action'}>
        <div style={{ display: 'flex' }}>
          <Button
            disabled={!!error}
            style={{ flex: '1' }}
            type={'primary'}
            loading={uploadLoading}
            onClick={() => {
              uploadRefresh();
            }}
          >
            Upload
          </Button>
          <div style={{ width: '20px' }}></div>
          <Button
            loading={loading}
            style={{ flex: '1' }}
            onClick={() => {
              refresh();
            }}
          >
            Refresh
          </Button>
        </div>
      </AppRow>
      <AppRow title={'Result'}>
        <Spin spinning={uploadLoading}>
          <AppResult error={uploadError} data={uploadData}></AppResult>
        </Spin>
      </AppRow>
      <a
        href='https://github.com/canyon-project/canyon'
        target={'_blank'}
        style={{ fontSize: '12px' }}
        rel='noreferrer'
      >
        Something wrong or missing?
      </a>
    </div>
  );
};

export default AppMain;
