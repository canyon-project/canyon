// import { CSSProperties } from 'react';

// import { CSSProperties } from 'preact-compat';

const LineNumber = ({ count, theme }) => {
  const style: any = {
    color: theme === 'light' ? '#0074D9' : '#0074D9',
    textAlign: 'right',
    padding: '0 5px 0 20px',
  };
  return (
    <div style={style}>
      {[...Array(count)].map((i, index) => {
        return <div key={index}>{index + 1}</div>;
      })}
    </div>
  );
};

export default LineNumber;
