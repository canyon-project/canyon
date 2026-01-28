import { ConfigProvider, Spin } from 'antd';
import type { FileCoverageData } from 'istanbul-lib-coverage';
import { type FC, Suspense, useEffect, useMemo, useState } from 'react';
import RIf from './components/RIf';
import { generateCoreDataForEachComponent } from './helpers/generateCoreDataForEachComponent';
// import { add } from './helpers/add';
import type { CanyonReportProps } from './types';
import CoverageDetail from './widgets/CoverageDetail';
import SummaryHeader from './widgets/SummaryHeader';
import SummaryList from './widgets/SummaryList';
import SummaryTree from './widgets/SummaryTree';
// import CoverageDetail from './widgets/CoverageDetail';
// import SummaryHeader from './widgets/SummaryHeader';
import TopControl from './widgets/TopControl';

export const CanyonReport: FC<CanyonReportProps> = ({
  value,
  name,
  dataSource,
  onSelect,
  defaultOnlyChange = false,
  onlyChange: controlledOnlyChange,
  onChangeOnlyChange: controlledOnChangeOnlyChange,
}) => {
  // 内部状态
  const [_isLoading, _setIsLoading] = useState<boolean>(false);
  const [filenameKeywords, setFilenameKeywords] = useState('');
  const [showMode, setShowMode] = useState('tree');
  const [fileCoverage, setFileCoverage] = useState<FileCoverageData>({
    path: '',
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {},
  });
  const [fileContent, setFileContent] = useState<string>('');
  const [fileCodeChange, setFileCodeChange] = useState<{
    additions: number[];
    deletions: number[];
  }>({
    additions: [],
    deletions: [],
  });

  // 判断是否为受控模式
  const isControlled =
    controlledOnlyChange !== undefined &&
    controlledOnChangeOnlyChange !== undefined;

  // 内部状态（非受控模式使用）
  const [internalOnlyChange, setInternalOnlyChange] =
    useState(defaultOnlyChange);

  // 使用受控或非受控的值
  const onlyChange = isControlled ? controlledOnlyChange : internalOnlyChange;

  const rootClassName = useMemo(
    () =>
      `report-scope-${Math.random().toString(36).slice(2, 9)} canyonjs-report-html`,
    [
      /* once */
    ],
  );

  function onChangeOnlyChange(v: boolean) {
    if (isControlled && controlledOnChangeOnlyChange) {
      // 受控模式：调用外部回调
      controlledOnChangeOnlyChange(v);
    } else {
      // 非受控模式：更新内部状态
      setInternalOnlyChange(v);
    }
  }
  const newOnSelect = useMemo(() => {
    return async (val: string) => {
      const res = await onSelect(val);
      setFileContent(res.fileContent || '');
      setFileCoverage(res.fileCoverage || {});
      setFileCodeChange(
        res.fileCodeChange || {
          additions: [],
          deletions: [],
        },
      );
      return res;
    };
  }, [onSelect]);

  useEffect(() => {
    newOnSelect(value);
  }, [newOnSelect, value]);
  const isFile = useMemo(() => {
    // Check if it's a file by common frontend file extensions
    const isFile = /\.(js|jsx|ts|tsx|vue)$/.test(value);
    return isFile;
  }, [value]);
  const mode = useMemo(() => {
    if (isFile) {
      return 'file';
    }
    return showMode;
  }, [showMode, isFile]);

  const isFileDataReady = useMemo(() => {
    const hasCoverage = fileCoverage && Object.keys(fileCoverage).length > 0;
    const hasContent = fileContent.length > 0;
    return hasCoverage && hasContent;
  }, [fileCoverage, fileContent]);

  const { treeDataSource, rootDataSource, listDataSource } = useMemo(() => {
    return generateCoreDataForEachComponent({
      dataSource,
      filenameKeywords,
      value,
      onlyChange,
    });
  }, [dataSource, value, filenameKeywords, onlyChange]);
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0071c2',
          borderRadius: 2,
        },
      }}
    >
      <div className={rootClassName}>
        <style>
          {`
          .${rootClassName} .canyon-coverage-detail-spin-wrapper { height: 100%; }
          .${rootClassName} .canyon-coverage-detail-spin-wrapper > .ant-spin-container { height: 100%; }
         `}
        </style>
        <TopControl
          onlyChange={onlyChange}
          filenameKeywords={filenameKeywords}
          showMode={showMode}
          onChangeShowMode={(val) => {
            setShowMode(val as 'tree' | 'list');
          }}
          onChangeOnlyChange={onChangeOnlyChange}
          total={listDataSource.length}
          onChangeKeywords={(val) => {
            setFilenameKeywords(val);
          }}
        />
        <SummaryHeader
          reportName={name}
          data={rootDataSource}
          value={value}
          onSelect={newOnSelect}
          onlyChange={onlyChange}
        />

        <RIf condition={mode === 'file'}>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
            }}
          >
            <Spin
              spinning={!isFileDataReady}
              wrapperClassName={'canyon-coverage-detail-spin-wrapper'}
            >
              <RIf condition={isFileDataReady}>
                <CoverageDetail
                  source={fileContent}
                  coverage={fileCoverage}
                  diff={fileCodeChange}
                />
              </RIf>
            </Spin>
          </div>
        </RIf>

        <Suspense fallback={<div className='p-8 text-center'>Loading...</div>}>
          {mode === 'tree' && (
            <SummaryTree
              dataSource={treeDataSource}
              onSelect={newOnSelect}
              onlyChange={onlyChange}
            />
          )}
          {mode === 'list' && (
            <SummaryList
              dataSource={listDataSource}
              onSelect={newOnSelect}
              filenameKeywords={filenameKeywords}
              onlyChange={onlyChange}
            />
          )}
        </Suspense>
      </div>
    </ConfigProvider>
  );
};

export default CanyonReport;
export type { CanyonReportProps } from './types';
