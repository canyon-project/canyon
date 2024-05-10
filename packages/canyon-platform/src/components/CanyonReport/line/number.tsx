// import { CSSProperties } from 'react';

// import { CSSProperties } from 'preact-compat';


import {getViewLineHeight} from "../../../helpers/utils/getViewLineHeight.tsx";

const LineNumber = ({ count, theme }) => {
  const viewLineHeight = getViewLineHeight();
  const style: any = {
    color: theme === 'light' ? '#0074D9' : '#0074D9',
    textAlign: 'right',
    padding: '0 5px 0 20px',
  };
  return (
    <div style={style}>
      {[...Array(count)].map((i, index) => {
        return (
          <div
            style={{ height: `${viewLineHeight}px`, lineHeight: `${viewLineHeight}px` }}
            key={index}
          >
            {index + 1}
          </div>
        );
      })}
    </div>
  );
};

export default LineNumber;
