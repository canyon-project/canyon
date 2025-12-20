import React from 'react';
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
  return React.createElement(
    'span',
    { className: 'line-number' },
    lineNumber
  );
};

// React 组件：变更标识
const LineChange = ({ hasChange }: { hasChange: boolean }) => {
  return React.createElement(
    'span',
    { className: 'line-change' },
    hasChange ? '+' : ''
  );
};

// React 组件：覆盖率信息
const LineCoverage = ({ 
  hit, 
  width 
}: { 
  hit: number; 
  width: number; 
}) => {
  return React.createElement(
    'span',
    {
      className: 'line-coverage',
      style: {
        background: genBgColor(hit),
        width: `${width}px`
      }
    },
    hit > 0 ? `${hit}x` : ''
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
  return React.createElement(
    'div',
    { className: 'line-number-wrapper' },
    React.createElement(LineNumber, { lineNumber }),
    React.createElement(LineChange, { hasChange: line.change }),
    React.createElement(LineCoverage, { 
      hit: line.hit, 
      width: maxHitWidth 
    })
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
    React.createElement(LineNumberWrapper, {
      lineNumber,
      line,
      maxHitWidth
    })
  );
}
