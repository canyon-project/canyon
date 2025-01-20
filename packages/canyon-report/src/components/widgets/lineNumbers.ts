function genBgColor(hit) {
  if (hit > 0) {
    return "rgb(230, 245, 208)";
  } else if (hit === 0) {
    return "rgb(252, 225, 229)";
  } else {
    return "rgb(234, 234, 234)";
  }
}

export const lineNumbers = (lineNumber: number, linesState) => {
  const line = linesState.find((line) => line.lineNumber === lineNumber) || {
    change: false,
    hit: 0,
    lineNumber: lineNumber,
  };
  const maxHit = Math.max(...linesState.map((line) => line.hit));
  // console.log(maxHit, "maxHit");
  const len = maxHit.toString().length;
  // console.log(len,'len')
  // 根据行号生成标识，后续会处理逻辑
  return `<div class="line-number-wrapper">
              <span class="line-number">${lineNumber}</span>
              <span class="line-change" style="background: ${line.change ? "green" : "unset"}"></span>
              <span class="line-coverage" style="background: ${genBgColor(line.hit)};width:${(len + 2) * 7.2}px">${line.hit > 0 ? line.hit + "x" : ""}</span>
            </div>`;
};
