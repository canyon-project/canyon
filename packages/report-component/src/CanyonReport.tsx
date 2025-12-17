import { ConfigProvider, Spin } from 'antd';
import {type FileCoverageData, Totals} from 'istanbul-lib-coverage';
import {type FC, Suspense, useEffect, useMemo, useState} from 'react';
// import { add } from './helpers/add';
import type { CanyonReportProps } from './types';
import SummaryHeader from './widgets/SummaryHeader';
import SummaryList from './widgets/SummaryList';
// import CoverageDetail from './widgets/CoverageDetail';
// import SummaryHeader from './widgets/SummaryHeader';
import TopControl from './widgets/TopControl';
import {generateCoreDataForEachComponent} from "./helpers/generateCoreDataForEachComponent";
import SummaryTree from './widgets/SummaryTree';
import RIf from "./components/RIf";
import CoverageDetail from './widgets/CoverageDetail';

export const CanyonReport: FC<CanyonReportProps> = ({
  value,
  name,
  dataSource,
                                                      onSelect
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
  const [fileCodeChange, setFileCodeChange] = useState<number[]>([]);
  const [onlyChange, setOnlyChange] = useState(Boolean(false));
  const rootClassName = useMemo(() => `report-scope-${Math.random().toString(36).slice(2, 9)}`,[/* once */]);

  function onChangeOnlyChange(v: boolean) {
    setOnlyChange(v);
  }
  async function newOnSelect(val: string) {
    const res = await onSelect(val);
    setFileContent(res.fileContent||'');
    setFileCoverage(res.fileCoverage||{});
    setFileCodeChange(res.fileCodeChange||'');
    return res;
  }
  useEffect(() => {
    newOnSelect(value);
  }, []);
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
  }, [showMode, value]);


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
    <div className={rootClassName}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#0071c2',
            borderRadius: 2
          },
        }}
      >
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
          <div style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            height:'100%'
          }}>
            <Spin spinning={!isFileDataReady} wrapperClassName={'canyon-coverage-detail-spin-wrapper'}>
              <RIf condition={isFileDataReady}>
                <CoverageDetail
                  fileContent={fileContent}
                  fileCoverage={fileCoverage}
                  fileCodeChange={fileCodeChange}
                />
              </RIf>
            </Spin>
          </div>
        </RIf>

        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          {mode === 'tree' && <SummaryTree dataSource={treeDataSource} onSelect={newOnSelect} onlyChange={onlyChange} />}
          {mode === 'list' && (
            <SummaryList
              dataSource={listDataSource}
              onSelect={newOnSelect}
              filenameKeywords={filenameKeywords}
              onlyChange={onlyChange}
            />
          )}
        </Suspense>
      </ConfigProvider>
    </div>

  );
};

export default CanyonReport;
export type { CanyonReportProps } from './types';
