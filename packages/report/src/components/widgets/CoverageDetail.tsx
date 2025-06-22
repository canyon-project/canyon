import { FC, useEffect, useMemo, useRef, useState } from 'react';
// import { initCanyonSpa } from 'canyon-report-spa';

import { theme } from 'antd';
const { useToken } = theme;
const FileCoverageDetail: FC<{
  fileContent: string;
  fileCodeChange: number[];
  fileCoverage: any;
}> = ({ fileContent, fileCoverage, fileCodeChange }) => {
  useEffect(() => {
    import(
      /* @vite-ignore */
      `${window.UNPKG_URL || 'https://unpkg.com'}/canyon-report-spa/dist/index.js`
    ).then((res) => {
      res.initCanyonSpa(document.getElementById('canyon-report-box'), {
        coverage: fileCoverage,
        content: fileContent,
        diff: fileCodeChange,
      });
    });
  }, []);

  return (
    <div>
      <div id={'canyon-report-box'} style={{ width: '100%' }}></div>
    </div>
  );
};

export default FileCoverageDetail;
