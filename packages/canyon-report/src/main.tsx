import './reset.css';
import './assets/css/index.css';

import { genSummaryMapByCoverageMap } from '@canyon/data';

import { init } from './index';
import { __coverage__, __filecontent__ } from './mock.ts';

function getDecode(str: string) {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
}

const report = init(document.querySelector('#root') as any, {
  theme: 'light',
  defaultPath: '~/src',
  onSelectFile(path: string) {
    if (path.includes('.')) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            // @ts-ignore
            fileCoverage: __coverage__[path],
            // @ts-ignore
            fileContent: getDecode(__filecontent__[path]),
            fileCodeChange: [1, 2, 3, 4],
          });
        }, 200);
      });
    } else {
      return new Promise((resolve) => {
        resolve({});
      });
    }
  },
});
report.setOption({
  summary: genSummaryMapByCoverageMap(__coverage__),
});
