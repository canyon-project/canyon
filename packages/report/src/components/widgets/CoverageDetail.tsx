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
    // initCanyonSpa(document.getElementById('box'), {
    //   coverage: fileCoverage,
    //   content: fileContent,
    //   diff:fileCodeChange
    // });

    // 创建 script 元素
    const script = document.createElement('script');
    // @ts-ignore
    script.src = (window.UNPKG_URL || 'https://unpkg.com') +
      '/canyon-report-spa/dist/index.umd.cjs'; // 替换为实际 URL
    // script.async = true; // 异步加载（默认）

    // 设置加载成功和失败的回调
    script.onload = () => {
      console.log('脚本加载成功');
      // 这里可以执行依赖该脚本的代码
      // @ts-ignore
      CanyonReportSpa.initCanyonSpa(
        document.getElementById('canyon-report-box'),
        {
          coverage: fileCoverage,
          content: fileContent,
          diff: fileCodeChange,
        },
      );
    };

    script.onerror = () => {
      console.error('脚本加载失败');
    };

    // 将脚本添加到页面
    document.head.appendChild(script);
  }, []);

  return (
    <div>
      <div id={'canyon-report-box'} style={{ width: '100%' }}></div>
    </div>
  );
};

export default FileCoverageDetail;
