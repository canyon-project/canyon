import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { initCanyonSpa } from 'canyon-report-spa';

import { theme } from 'antd';
const { useToken } = theme;
const FileCoverageDetail: FC<{
  fileContent: string;
  fileCodeChange: number[];
  fileCoverage: any;
}> = ({ fileContent, fileCoverage, fileCodeChange }) => {
  useEffect(() => {
    initCanyonSpa(document.getElementById('box'), {
      coverage: fileCoverage,
      content: fileContent,
      diff:fileCodeChange
    });
  }, []);

  return (
    <div>
      <div id={'box'} style={{width:'100%'}}></div>
    </div>
  );
};

export default FileCoverageDetail;
