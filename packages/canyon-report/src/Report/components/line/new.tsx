const LineNew = ({ news, count }) => {
  return (
    <div style={{ width: '20px', textAlign: 'center' }}>
      {[...Array(count)].map((line, index) => {
        return (
          <div style={{ height: '14px', color: 'green', width: '20px' }}>
            {news.includes(index + 1) ? '+' : ''}
          </div>
        );
      })}
    </div>
  );
};

export default LineNew;
