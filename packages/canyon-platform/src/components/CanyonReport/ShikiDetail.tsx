import { codeToHtml } from 'https://esm.sh/shiki@1.0.0';

import { mergeIntervals } from './helper.tsx';

const ShikiDetail = ({ defaultValue, filecoverage, theme }) => {
  const [content, setContent] = useState('');

  const statementStats = filecoverage.s;
  const statementMeta = filecoverage.statementMap;
  const structuredText = defaultValue
    .split('\n')
    .reduce((previousValue, currentValue, currentIndex) => {
      return {
        ...previousValue,
        [currentIndex]: currentValue,
      };
    }, {});
  const statementDecorations = [];

  Object.entries(statementStats).forEach(([stName, count]) => {
    const meta = statementMeta[stName];
    const type = count > 0 ? 'yes' : 'no';
    const startCol = meta.start.column;
    let endCol = meta.end.column + 1;
    const startLine = meta.start.line;
    const endLine = meta.end.line;

    if (type === 'no' && structuredText[startLine]) {
      if (endLine !== startLine) {
        endCol = structuredText[startLine].length;
      }
      //     转化为字符的起始

      let start = 0;
      let end = 0;

      for (let i = 0; i < startLine - 1; i++) {
        start += structuredText[i].length + 1;
      }
      for (let i = 0; i < endLine - 1; i++) {
        end += structuredText[i].length + 1;
      }

      start += startCol;
      end += endCol;
      statementDecorations.push([start, end]);
    }
  });

  const fnDecorations = [];
  const fnStats = filecoverage.f;
  const fnMeta = filecoverage.fnMap;
  Object.entries(fnStats).forEach(([fName, count]) => {
    const meta = fnMeta[fName];
    const type = count > 0 ? 'yes' : 'no';
    // Some versions of the instrumenter in the wild populate 'func'
    // but not 'decl':
    const decl = meta.decl || meta.loc;
    const startCol = decl.start.column;
    let endCol = decl.end.column + 1;
    const startLine = decl.start.line;
    const endLine = decl.end.line;

    if (type === 'no' && structuredText[startLine]) {
      if (endLine !== startLine) {
        endCol = structuredText[startLine].length;
      }

      //     转化为字符的起始

      let start = 0;
      let end = 0;

      for (let i = 0; i < startLine - 1; i++) {
        start += structuredText[i].length + 1;
      }
      for (let i = 0; i < endLine - 1; i++) {
        end += structuredText[i].length + 1;
      }

      start += startCol;
      end += endCol;
      fnDecorations.push([start, end]);
    }
  });

  codeToHtml(defaultValue, {
    lang: 'javascript',
    theme: theme === 'light' ? 'light-plus' : 'tokyo-night',
    decorations: mergeIntervals(
      [...statementDecorations, ...fnDecorations].filter((item) => {
        return item[0] < item[1];
      }),
    ).map(([start, end]) => {
      return {
        start,
        end,
        properties: { class: 'content-class-no-found' },
      };
    }),
  })
    .then((res) => {
      setContent(res);
    })
    .catch((err) => {
      console.log('覆盖率着色失败', err);
      codeToHtml(defaultValue, {
        lang: 'javascript',
        theme: theme === 'light' ? 'light-plus' : 'tokyo-night',
      }).then((r) => {
        setContent(r);
      });
    });
  return (
    <div className={'px-[12px] overflow-x-auto w-full'}>
      <div dangerouslySetInnerHTML={{ __html: content }}></div>
    </div>
  );
};

export default ShikiDetail;
