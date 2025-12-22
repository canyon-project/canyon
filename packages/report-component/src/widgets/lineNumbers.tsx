import { renderToStaticMarkup } from 'react-dom/server';

interface LineState {
  lineNumber: number;
  hit: number;
  change: boolean;
}

function genBgColor(hit: number): string {
  if (hit > 0) {
    return 'rgb(230, 245, 208)';
  } else if (hit === 0) {
    return '#f3aeac';
  } else {
    return 'rgb(234, 234, 234)';
  }
}

// React 组件：行号
const LineNumber = ({ lineNumber }: { lineNumber: number }) => {
  return <span className="line-number">{lineNumber}</span>;
};

// React 组件：变更标识
const LineChange = ({ hasChange }: { hasChange: boolean }) => {
  return <span className="line-change">{hasChange ? '+' : ''}</span>;
};

// React 组件：覆盖率信息
const LineCoverage = ({ 
  hit, 
  width 
}: { 
  hit: number; 
  width: number; 
}) => {
  return (
    <span
      className="line-coverage"
      style={{
        background: genBgColor(hit),
        width: `${width}px`
      }}
    >
      {hit > 0 ? `${hit}x` : ''}
    </span>
  );
};

// React 组件：完整的行号包装器
const LineNumberWrapper = ({
  lineNumber,
  line,
  maxHitWidth
}: {
  lineNumber: number;
  line: LineState;
  maxHitWidth: number;
}) => {
  return (
    <div className="line-number-wrapper">
      <LineNumber lineNumber={lineNumber} />
      <LineChange hasChange={line.change} />
      <LineCoverage hit={line.hit} width={maxHitWidth} />
    </div>
  );
};

export default function lineNumbers(
  lineNumber: number, 
  linesState: LineState[], 
  _addLines?: unknown
): string {
  const line = linesState.find((line) => line.lineNumber === lineNumber) || {
    change: false,
    hit: 0,
    lineNumber: lineNumber,
  };
  
  const maxHit = Math.max(...linesState.map((line) => line.hit));
  const len = maxHit.toString().length;
  const maxHitWidth = (len + 2) * 7.2;
  
  // 使用 React 组件渲染整个行号包装器
  return renderToStaticMarkup(
    <LineNumberWrapper
      lineNumber={lineNumber}
      line={line}
      maxHitWidth={maxHitWidth}
    />
  );
}