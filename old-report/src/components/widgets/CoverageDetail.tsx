import { type FC, useEffect } from 'react';

const FileCoverageDetail: FC<{
  fileContent: string;
  fileCodeChange: number[];
  fileCoverage: any;
  theme: string;
}> = ({ fileContent, fileCoverage, fileCodeChange, theme }) => {
  useEffect(() => {
    // canyon-report-spa 源码地址 https://github.com/canyon-project/spa
    import(
      /* @vite-ignore */
      `${window.UNPKG_URL || 'https://unpkg.com'}/@canyonjs/report-spa/dist/index.js`
    ).then((res) => {
      res.initCanyonSpa(document.getElementById('canyon-report-box'), {
        coverage: fileCoverage,
        content: fileContent,
        diff: fileCodeChange,
        theme: theme,
        height:'100%',
        showDecorations: window.canyonShowDecorations
      });
    });
  }, []);

  return (
    <div id={'canyon-report-box'} />
  );
};

export default FileCoverageDetail;
