import type { FileCoverageData } from 'istanbul-lib-coverage';
import { type FC, Suspense, useEffect, useMemo, useState } from 'react';
import { type ReportProps, ThemeEnum } from '../types';
import { generateCoreDataForEachComponent } from './helpers/generateCoreDataForEachComponent';
import CoverageDetail from './widgets/CoverageDetail';
import SummaryHeader from './widgets/SummaryHeader';
import SummaryList from './widgets/SummaryList';
import SummaryTree from './widgets/SummaryTree';
import TopControl from './widgets/TopControl';
import RIf from "./RIf.tsx";
import {Spin} from "antd";

const ReportComponent: FC<ReportProps> = ({ theme, onSelect, value, dataSource, name, defaultOnlyShowChanged }) => {
  // 内部状态
  const [_isLoading, _setIsLoading] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeEnum | string>(theme);
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
  const [onlyChange, setOnlyChange] = useState(Boolean(defaultOnlyShowChanged));
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

  const { treeDataSource, rootDataSource, listDataSource } = useMemo(() => {
    return generateCoreDataForEachComponent({
      dataSource,
      filenameKeywords,
      value,
      onlyChange,
    });
  }, [dataSource, value, filenameKeywords, onlyChange]);

  const isFileDataReady = useMemo(() => {
    const hasCoverage = fileCoverage && Object.keys(fileCoverage).length > 0;
    const hasContent = fileContent.length > 0;
    return hasCoverage && hasContent;
  }, [fileCoverage, fileContent]);

  return (
    <div className={rootClassName} style={{
      height:'100%',
      display:'flex',
      flexDirection:'column'
    }}>
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
        theme={currentTheme}
        onChangeTheme={(newTheme) => {
          setCurrentTheme(newTheme);
          // 添加类名到 body 以便应用全局主题样式
          if (newTheme === ThemeEnum.Dark) {
            document.body.classList.add('dark-theme');
          } else {
            document.body.classList.remove('dark-theme');
          }
        }}
      />
      <SummaryHeader reportName={name} data={rootDataSource} value={value} onSelect={newOnSelect} onlyChange={onlyChange}/>

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
                theme={currentTheme}
              />
            </RIf>
          </Spin>
        </div>
      </RIf>


      <Suspense fallback={<div className='p-8 text-center'>Loading...</div>}>
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
    </div>
  );
};

export default ReportComponent;
