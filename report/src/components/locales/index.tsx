import { type FC, type ReactNode, createContext, useCallback, useContext } from 'react';

export const translations = {
  cn: {
    hello: '你好',
    settings: {
      name: '名称',
      title: '设置',
    },
    components: {
      topControl: {
        codeTree: '代码树',
        fileList: '文件列表',
        totalFiles: '个文件',
        onlyChanged: '仅显示变更',
        searchPlaceholder: '输入文件路径搜索',
      },
      summaryMetric: {
        statements: '语句',
        branches: '分支',
        functions: '函数',
        lines: '行数',
        newlines: '新行',
        changebranches: '变更分支',
        changefunctions: '变更函数',
      },
    },
  },
  en: {
    hello: 'Hello',
    settings: {
      name: 'Name',
      title: 'Settings',
    },
    components: {
      topControl: {
        codeTree: 'Code tree',
        fileList: 'File list',
        totalFiles: 'total files',
        onlyChanged: 'Only Changed',
        searchPlaceholder: 'Enter the file path to search',
      },
      summaryMetric: {
        statements: 'Statements',
        branches: 'Branches',
        functions: 'Functions',
        lines: 'Lines',
        newlines: 'Newlines',
        changebranches: 'Changed Branches',
        changefunctions: 'Changed Functions',
      },
    },
  },
  ja: {
    hello: 'こんにちは',
    settings: {
      name: '名前',
      title: '設定',
    },
    components: {
      topControl: {
        codeTree: 'コードツリー',
        fileList: 'ファイルリスト',
        totalFiles: '個のファイル',
        onlyChanged: '変更のみ',
        searchPlaceholder: 'ファイルパスを入力して検索',
      },
      summaryMetric: {
        statements: 'ステートメント',
        branches: 'ブランチ',
        functions: '関数',
        lines: '行',
        newlines: '新しい行',
        changebranches: '変更されたブランチ',
        changefunctions: '変更された関数',
      },
    },
  },
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}${'.'}${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<typeof translations.en>;

const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) as string;
};

export const translate = (language: string, key: TranslationKey): string => {
  const lang = language.toLowerCase();
  if (lang in translations) {
    const result = getNestedValue(translations[lang as keyof typeof translations], key);
    return result || getNestedValue(translations.en, key);
  }
  return getNestedValue(translations.en, key);
};

export const LanguageContext = createContext('en');

interface LanguageProviderProps {
  language: string;
  children: ReactNode;
}

export const LanguageProvider: FC<LanguageProviderProps> = ({ language, children }) => {
  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>;
};

export const useTrans = () => {
  const language = useContext(LanguageContext);
  return useCallback((key: TranslationKey) => translate(language, key), [language]);
};
