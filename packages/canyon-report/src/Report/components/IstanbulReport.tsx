import { CoverageSummaryDataMap, genSummaryTreeItem } from '@canyon/data';
import { FC, useMemo } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';

import { classForPercent } from '../../helper.ts';
import { Dims, IstanbulReportProps } from '../types';
import Code from './code.tsx';
import Th from './Th';
import Tr from './Tr';

const capitalized = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

const dims = ['statements', 'branches', 'functions', 'lines', 'newlines'];
const IstanbulReport: FC<IstanbulReportProps> = ({
  theme,
  defaultPath,
  onSelectFile,
  watermarks,
}) => {
  const [summary, setSummary] = useState<CoverageSummaryDataMap>({});
  // @ts-ignore
  const [fileCoverage, setFileCoverage] = useState({} as any);
  const [fileContent, setFileContent] = useState('');
  const [fileCodeChange, setFileCodeChange] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePath, setActivePath] = useState(defaultPath);

  const summaryTreeItem = useMemo(() => {
    return genSummaryTreeItem(activePath, summary);
  }, [activePath, summary]);
  const paths = useMemo(() => {
    return activePath
      .split('/')
      .reduce(
        (pre: { path: string; name: string }[], cur, currentIndex, array) => {
          if (currentIndex !== array.length - 1) {
            pre.push({
              path: array.slice(0, currentIndex + 1).join('/'),
              name: cur,
            });
          }
          return pre;
        },
        [],
      );
  }, [activePath]);

  useEffect(() => {
    setLoading(true);
    onSelectFile(activePath).then(
      ({ fileContent, fileCoverage, fileCodeChange }) => {
        if (activePath.includes('.')) {
          setFileContent(fileContent);
          setFileCoverage(fileCoverage);
          setFileCodeChange(fileCodeChange);
        }
        setLoading(false);
      },
    );
  }, [activePath]);
  useEffect(() => {
    const handleSetOptionEvent = (e: { detail: any }) => {
      setSummary(e.detail);
    };
    // @ts-ignore
    window.addEventListener('setOptionEvent', handleSetOptionEvent);
    return () => {
      // @ts-ignore
      window.removeEventListener('setOptionEvent', handleSetOptionEvent);
    };
  }, []); // 空数组表示仅在组件挂载和卸载时运行

  return (
    <div id={'canyon-report'} className={theme}>
      <div className={'pad1'}>
        <h1>
          <a
            onClick={() => {
              setActivePath('~');
            }}
          >
            All files
          </a>
          <span> / </span>
          <div className="pathnames" style="display: inline">
            {paths.map(({ path, name }) => {
              return (
                <>
                  <a
                    onClick={() => {
                      setActivePath(path);
                    }}
                  >
                    {name}
                  </a>
                  &nbsp;/&nbsp;
                </>
              );
            })}
          </div>
          <span>&nbsp;</span>
          <span className="filename">
            {summaryTreeItem.path.split('/').at(-1)}
          </span>
        </h1>
        <div className="clearfix">
          {dims.map((dim) => (
            <div className="fl pad1y space-right2">
              <span className="strong" style={{ marginRight: '5px' }}>
                {/*// @ts-ignore*/}
                {summaryTreeItem.summary[dim].pct}%
              </span>
              <span className="quiet" style={{ marginRight: '5px' }}>
                {capitalized(dim)}
              </span>
              <span className="fraction">
                {/*// @ts-ignore*/}
                {summaryTreeItem.summary[dim].covered}/{/*// @ts-ignore*/}
                {summaryTreeItem.summary[dim].total}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        className={`status-line ${classForPercent(
          Dims.statements,
          summaryTreeItem.summary.statements.pct,
          watermarks,
        )}`}
      />

      {summaryTreeItem.children.length > 0 ? (
        <div className="pad1">
          <table className="coverage-summary">
            <Th />
            <tbody>
              {/*// @ts-ignore*/}
              {summaryTreeItem.children
                .filter(
                  (item) =>
                    // 过滤掉这些
                    !['index.android.js', 'index.ios.js'].some((str) => {
                      return item.path.includes(str);
                    }),
                )
                .map(({ path, summary }) => {
                  return (
                    <Tr
                      setActivePath={(p) => {
                        setActivePath(p);
                      }}
                      path={path}
                      item={summary}
                      watermarks={watermarks}
                    />
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <Code
            filePath={activePath}
            fileCoverage={fileCoverage}
            fileContent={fileContent}
            fileCodeChange={fileCodeChange}
            theme={theme}
          />
        )
      )}
      {loading && <div className="loading">loading...</div>}
    </div>
  );
};

export default IstanbulReport;
