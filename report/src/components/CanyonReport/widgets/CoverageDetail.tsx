import { type FC, useEffect } from 'react';
import * as res from 'canyon-report-spa';
const FileCoverageDetail: FC<{
  fileContent: string;
  fileCodeChange: number[];
  fileCoverage: any;
  theme: string;
}> = ({ fileContent, fileCoverage, fileCodeChange, theme }) => {
  useEffect(() => {
    res.initCanyonSpa(document.getElementById('canyon-report-box'), {
      coverage: fileCoverage,
      content: fileContent,
      diff: fileCodeChange,
      theme: theme,
      height:'500px'
    });
  }, []);

  return (
    <div id={'canyon-report-box'} />
  );
};

export default FileCoverageDetail;
