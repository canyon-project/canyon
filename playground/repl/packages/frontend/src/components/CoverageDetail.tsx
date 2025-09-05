import { type FC, useEffect } from 'react';

const FileCoverageDetail: FC<{
  fileContent: string;
  fileCodeChange: number[];
  fileCoverage: any;
  theme: string;
}> = ({ fileContent, fileCoverage, fileCodeChange, theme }) => {
  console.log(fileCoverage,fileContent)
  useEffect(() => {
    // canyon-report-spa 源码地址 https://github.com/canyon-project/spa
    import(
      /* @vite-ignore */
      `${(window as any).UNPKG_URL || 'https://unpkg.com'}/canyon-report-spa/dist/index.js`
    ).then((res) => {
      res.initCanyonSpa(document.getElementById('canyon-report-box'), {
        coverage: fileCoverage,
        content: fileContent,
        diff: fileCodeChange,
        theme: theme,
        height:'100%'
      });
    });
  }, []);

  return (
    <div id={'canyon-report-box'} className="min-h-[420px] rounded-md border border-gray-200" />
  );
};

export default FileCoverageDetail;
