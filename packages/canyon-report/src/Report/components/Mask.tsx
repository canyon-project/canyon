import { FC, useEffect, useRef } from 'preact/compat';
interface MaskProps {
  code: string;
  coverage: any;
}
function convertToRectangularDataFormatOfSketchpad(code: string, marks: any[]) {
  // 1.生成rows
  const rows = [''];
  let index = 0;
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '\n') {
      index += 1;
      rows.push('');
    } else {
      rows[index] += code[i];
    }
  }
  const newMarks = [];
  for (let mark = 0; mark < marks.length; mark++) {
    if (marks[mark].start[1] < marks[mark].end[1]) {
      // 开始
      const startX = marks[mark].start[0];
      const startY = marks[mark].start[1];
      const startRowLen = rows[startY].length - 1;
      newMarks.push({
        start: [startX, startY],
        end: [startRowLen, startY],
      });
      // 结束
      const endX = marks[mark].end[0];
      const endY = marks[mark].end[1];
      newMarks.push({
        start: [0, endY],
        end: [endX, endY],
      });
      for (let i = 0; i < endY - startY - 1; i++) {
        // 找到第Y行
        const Y = startY + (i + 1);
        const mRowLen = rows[Y].length;
        newMarks.push({
          start: [0, Y],
          end: [mRowLen, Y],
        });
      }
    } else {
      newMarks.push(marks[mark]);
    }
  }
  return newMarks;
}
const Mask: FC<MaskProps> = ({ code, coverage }) => {
  const unitWidth = 8.43;
  const unitHeight = 21;
  const c = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = c.current;
    if (canvas) {
      // canvas.style.width = width + "px";
      // canvas.style.height = height + "px";
      // canvas.height = height * window.devicePixelRatio;
      // canvas.width = width * window.devicePixelRatio;
      // ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const ch = document.querySelector('.hljs')?.clientHeight || 0;
      const cw = document.querySelector('.hljs')?.clientWidth || 0;
      const ctx = canvas.getContext('2d');

      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';

      canvas.height = ch * window.devicePixelRatio;
      canvas.width = cw * window.devicePixelRatio;
      // @ts-ignore
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // 核心逻辑

      // const file = data;
      const originalMarksFn: any = [];
      const originalMarksStatement: any = [];
      // const coverage = file.coverage;
      const fnStats = coverage.f;
      const fnMeta = coverage.fnMap;
      if (!fnStats) {
        return;
      }
      Object.entries(fnStats).forEach(([fName, count]: any) => {
        const meta = fnMeta[fName];
        const type = count > 0 ? 'yes' : 'no';
        const decl = meta.decl || meta.loc;
        const startCol = decl.start.column;
        const endCol = decl.end.column + 1;
        const startLine = decl.start.line - 1;
        const endLine = decl.end.line - 1;
        if (type === 'no') {
          originalMarksFn.push({
            start: [startCol, startLine],
            end: [endCol, endLine],
          });
        }
      });
      // 语句标记
      const statementStats = coverage.s;
      const statementMeta = coverage.statementMap;
      Object.entries(statementStats).forEach(([stName, count]: any) => {
        const meta = statementMeta[stName];
        const type = count > 0 ? 'yes' : 'no';
        const startCol = meta.start.column;
        const endCol = meta.end.column + 1;
        const startLine = meta.start.line - 1;
        const endLine = meta.end.line - 1;
        if (type === 'no') {
          originalMarksStatement.push({
            start: [startCol, startLine],
            end: [endCol, endLine],
          });
        }
      });

      if (ctx) {
        const marks = originalMarksFn;
        // canvas.style.border = '1px dashed #999';
        const newMarks1 = convertToRectangularDataFormatOfSketchpad(
          code,
          originalMarksStatement,
        );
        for (let i = 0; i < newMarks1.length; i++) {
          ctx.fillStyle = 'pink';
          ctx.fillRect(
            newMarks1[i].start[0] * unitWidth,
            newMarks1[i].start[1] * unitHeight,
            unitWidth * (newMarks1[i].end[0] - newMarks1[i].start[0]),
            unitHeight,
          );
        }

        const newMarks = convertToRectangularDataFormatOfSketchpad(code, marks);
        for (let i = 0; i < newMarks.length; i++) {
          ctx.fillStyle = 'red';
          ctx.fillRect(
            newMarks[i].start[0] * unitWidth,
            newMarks[i].start[1] * unitHeight,
            unitWidth * (newMarks[i].end[0] - newMarks[i].start[0]),
            unitHeight,
          );
        }
      }
    }
  }, [code]);

  return (
    <canvas
      style={{ position: 'absolute', zIndex: 1, left: 140, top: 0, opacity: 1 }}
      ref={c}
    >
      你的浏览器不支持canvas，请升级浏览器
    </canvas>
  );
};

export default Mask;
