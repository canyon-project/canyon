// import { CSSProperties } from 'react';

const LineCoverage = ({ covers, theme }) => {
  return (
    <div style={{ textAlign: 'right' }}>
      {covers.map(({ covered, hits }, index) => {
        if (covered === 'yes') {
          return (
            <div
              key={index}
              style={{
                backgroundColor:
                  theme === 'light' ? 'rgb(230,245,208)' : '#0A6640',
                color: theme === 'light' ? 'rgba(0,0,0,0.5)' : '#eaeaea',
                padding: '0 5px',
              }}
            >
              {hits}x
            </div>
          );
        } else if (covered === 'no') {
          return (
            <div
              key={index}
              style={{
                backgroundColor:
                  theme === 'light' ? 'rgb(252,225,229)' : '#7A5474',
                color: theme === 'light' ? 'rgba(0,0,0,0.5)' : '#eaeaea',
                padding: '0 5px',
                height: '14px',
              }}
            ></div>
          );
        } else {
          return (
            <div
              key={index}
              style={{
                backgroundColor:
                  theme === 'light' ? 'rgb(234,234,234)' : 'rgb(45, 52, 54)',
                color: theme === 'light' ? 'rgba(0,0,0,0.5)' : '#eaeaea',
                padding: '0 5px',
                height: '14px',
              }}
            ></div>
          );
        }
      })}
    </div>
  );
};

export default LineCoverage;
