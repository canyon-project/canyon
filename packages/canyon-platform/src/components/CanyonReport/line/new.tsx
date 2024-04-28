const LineNew = ({ news, count }) => {
  return (
    <div style={{ width: '16px', textAlign: 'center' }}>
      {[...Array(count)].map((line, index) => {
        return (
          <div
            style={{
              height: '18px',
              backgroundColor: news.includes(index + 1) ? 'rgb(75,156,78)' : 'rgba(0,0,0,0)',
              width: '3.6px',
            }}
          >
            {/*{news.includes(index + 1) ? '+' : ''}*/}
          </div>
        );
      })}
    </div>
  );
};

export default LineNew;
