import { Spin } from 'antd';
import type { FileCoverageData } from 'istanbul-lib-coverage';
import { type FC, Suspense, useEffect, useMemo, useState } from 'react';
import { useTrans } from '../locales';
import { type ReportProps, ThemeEnum } from '../types';
import { generateCoreDataForEachComponent } from './helpers/generateCoreDataForEachComponent';
import CoverageDetail from './widgets/CoverageDetail';
import SummaryHeader from './widgets/SummaryHeader';
import SummaryList from './widgets/SummaryList';
import SummaryTree from './widgets/SummaryTree';
import TopControl from './widgets/TopControl';

const ReportComponent: FC<ReportProps> = ({ theme, onSelect, value, dataSource, name }) => {
  console.log(theme, onSelect, value);
  const _t = useTrans();

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
  const [onlyChange, setOnlyChange] = useState(Boolean(false));

  function onChangeOnlyChange(v) {
    setOnlyChange(v);
  }
  async function newOnSelect(val: string) {
    const res = await onSelect(val);
    setFileContent(res.fileContent);
    setFileCoverage(res.fileCoverage);
    setFileCodeChange(res.fileCodeChange);
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

  return (
    <>
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
      <SummaryHeader reportName={name} data={rootDataSource} value={value} onSelect={newOnSelect} />
      {mode === 'file' &&
        Object.keys(fileCoverage).length > 0 &&
        Object.keys(fileContent).length > 0 && (
          <CoverageDetail
            fileContent={fileContent}
            fileCodeChange={fileCodeChange}
            fileCoverage={fileCoverage}
            theme={theme}
          />
        )}
      <Suspense
        fallback={
          <div className='p-8 text-center'>
            <Spin size='large' />
          </div>
        }
      >
        {mode === 'tree' && <SummaryTree dataSource={treeDataSource} onSelect={newOnSelect} />}
        {mode === 'list' && (
          <SummaryList
            dataSource={listDataSource}
            onSelect={newOnSelect}
            filenameKeywords={filenameKeywords}
          />
        )}
      </Suspense>
    </>
  );
};

export default ReportComponent;
