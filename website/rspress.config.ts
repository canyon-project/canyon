import * as path from 'node:path';
import { defineConfig } from '@rspress/core';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Canyon',
  description: 'JavaScript 代码覆盖率解决方案',
  lang: 'zh',
  icon: '/rspress-icon.png',
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
  },
  locales: [
    {
      lang: 'zh',
      label: '简体中文',
      title: 'Canyon',
      description: 'JavaScript 代码覆盖率解决方案',
    },
    {
      lang: 'en',
      label: 'English',
      title: 'Canyon',
      description: 'JavaScript code coverage solution',
    },
  ],
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/canyon-project/canyon',
      },
    ],
  },
});
