import { FC } from 'preact/compat';

interface LineProps {
  lines: any[];
  newlines: number[];
}
const Line: FC<LineProps> = ({ lines, newlines }) => {
  //   0 粉色，1 绿色，-1没有颜色

  function getBgColor(num: number) {
    if (num === -1) {
      return 'rgb(234, 234, 234)';
    } else if (num === 0) {
      return '#fce1e5';
    }
    return '#e6f5d0';
  }
  return (
    <div>
      {lines.map((line, index) => {
        return (
          <div
            key={index}
            style={{ display: 'flex', marginRight: '10px', color: '#00000080' }}
          >
            <div style={{ color: 'green', lineHeight: '21px', width: '20px' }}>
              {newlines.includes(index + 1) ? '+' : null}
            </div>

            <div
              style={{
                backgroundColor: getBgColor(line.executionNumber),
                width: '60px',
                lineHeight: '21px',
              }}
            >
              {line.executionNumber > 0 ? line.executionNumber + 'x' : null}
            </div>
            <div
              style={{
                width: '60px',
                textAlign: 'right',
                lineHeight: '21px',
                backgroundColor: 'rgb(247, 247, 247)',
              }}
            >
              {index + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Line
