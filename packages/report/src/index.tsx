import { FC, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import enUS from 'antd/es/locale/en_US';
import jaJP from 'antd/es/locale/ja_JP';
import zhCN from 'antd/es/locale/zh_CN';
import { LanguageProvider } from './locales';
import ReportComponent from './components/Report';
import { ReportProps } from './types';
import { emptyFileCoverageData } from './components/helpers/const';

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

  // 定义 CSS 字符串
  const css = `

.YourHighlightClass {
  padding: 0 !important;
  color: white !important;
  background: rgb(244, 176, 27) !important;
}

/*新版canyon-report*/

.line-number-wrapper {
  display: flex;
  /*从右边开始*/
  justify-content: flex-end;
  /*text-align: right;*/
}

.line-number-wrapper .line-number {
  /*width: 60px;*/
  padding-right: 5px;
}

.line-number-wrapper .line-change {
  width: 4px;
  /*display: block;*/
}

.line-number-wrapper .line-coverage {
  width: 60px;
  padding-right: 5px;
  color: rgba(0, 0, 0, 0.5);
}

.dark .line-number-wrapper .line-coverage {
  width: 60px;
  padding-right: 5px;
  color: #eaeaea;
}

/*额外的*/
.content-class-no-found {
  background: #f6c6ce;
}

.dark .content-class-no-found {
  background: #7A5474;
}

    `;

  useEffect(() => {
    // 创建一个 <style> 元素
    const styleElement = document.createElement('style');
    // 将 CSS 字符串赋值给 <style> 元素的 innerHTML
    styleElement.innerHTML = css;
    // 将 <style> 元素插入到 <head> 标签中
    document.head.appendChild(styleElement);

    // 组件卸载时的清理操作
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <LanguageProvider language={language}>
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
    </LanguageProvider>
  );
};

export default Report;
