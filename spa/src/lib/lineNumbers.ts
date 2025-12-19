function genBgColor(hit, isDark) {
  if (hit > 0) {
    return isDark ? "#0A6640" : "rgb(230, 245, 208)";
  } else if (hit === 0) {
    return isDark ? "#7A5474" : "rgb(252, 225, 229)";
  } else {
    return isDark ? "rgb(45, 52, 54)" : "rgb(234, 234, 234)";
  }
}

export const lineNumbers = (lineNumber: number, linesState, isDark) => {
  const line = linesState.find((line) => line.lineNumber === lineNumber) || {
    change: false,
    hit: 0,
    lineNumber: lineNumber,
  };
  const maxHit = Math.max(...linesState.map((line) => line.hit));
  const len = maxHit.toString().length;
  // 根据行号生成标识，后续会处理逻辑
  return `<div class="line-number-wrapper">
              <span class="line-number">${lineNumber}</span>
              <span class="line-change">${line.change?'+':''}</span>
              ${line.change ? `<span class="line-coverage" style="background: ${genBgColor(line.hit, isDark)};width:${(len + 2) * 7.2}px">${line.hit > 0 ? line.hit + "x" : ""}</span>` : `<div class="line-coverage" style="width:${(len + 2) * 7.2}px;background: rgb(234, 234, 234)"></div>`}
            </div>`;
};
