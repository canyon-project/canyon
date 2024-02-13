const LineNew = ({news}) => {
  // const news = [1, 2, 3, 7, 8, 9, 10, 14, 15];
  return (
    <div style={{ width: '20px', textAlign: 'center' }}>
      {[...Array(200)].map((line, index) => {
        return (
          <div style={{ height: '14px', color: 'green' }}>
            {news.includes(index) ? '+' : ''}
          </div>
        );
      })}
    </div>
  );
};

export default LineNew;
