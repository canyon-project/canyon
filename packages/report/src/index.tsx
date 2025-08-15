import { FC, useEffect, lazy, Suspense } from 'react';
import { ConfigProvider, theme, Spin } from 'antd';
import enUS from 'antd/es/locale/en_US';
import jaJP from 'antd/es/locale/ja_JP';
import zhCN from 'antd/es/locale/zh_CN';
import { LanguageProvider } from './locales';
import { ReportProps } from './types';
import { emptyFileCoverageData } from './components/helpers/const';

// 使用懒加载导入组件
const ReportComponent = lazy(() => import('./components/Report'));

const languages = {
  cn: zhCN,
  en: enUS,
  ja: jaJP,
};

const { darkAlgorithm } = theme;

const onSelectDefault = () => {
  return Promise.resolve({
    fileContent: '',
    fileCoverage: emptyFileCoverageData,
    fileCodeChange: [],
  });
};

const Report: FC<ReportProps> = (props) => {
  const {
    theme = 'light',
    language = 'en',
    dataSource = {},
    onSelect = onSelectDefault,
    defaultOnlyShowChanged = false,
    value = '',
    name = 'untitled',
  } = props;
  const isDark = theme === 'dark';
  // 创建一个新的对象，包含所有的 props 及其默认值
  const mergedProps = {
    theme,
    language,
    dataSource,
    onSelect,
    defaultOnlyShowChanged,
    value,
    name,
  };

  return (
    <LanguageProvider language={language}>
      <Suspense fallback={<div className="loading-container"><Spin size="large" tip="Loading report..." /></div>}>
      <ConfigProvider
        locale={languages[language]}
        theme={{
          token: {
            colorPrimary: '#0071c2',
            borderRadius: 2,
          },
          algorithm: isDark ? [darkAlgorithm] : [],
        }}
        >
          <ReportComponent {...mergedProps} />
        </ConfigProvider>
      </Suspense>
      </LanguageProvider>
    );
  };
}

export default Report;
