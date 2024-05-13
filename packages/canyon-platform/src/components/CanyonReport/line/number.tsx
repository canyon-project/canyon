import { getViewLineHeight } from '../../../helpers/utils/getViewLineHeight.tsx';

const LineNumber = ({ count, theme }) => {
  const viewLineHeight = getViewLineHeight();
  const style: any = {
    color: theme === 'light' ? '#0074D9' : '#0074D9',
    textAlign: 'right',
    padding: '0 5px 0 20px',
  };
  setTimeout(() => {
    try {
      document.getElementById(`${window.location.hash.replace('#', '')}`).scrollIntoView();
    } catch (e) {
      // console.error(e);
    }
  }, 0);

  const activeLine = Number(window.location.hash.replace('#L', '')) - 1;
  return (
    <div style={style}>
      {[...Array(count)].map((i, index) => {
        return (
          <a
            id={`L${index + 1}`}
            href={`#L${index + 1}`}
            className={'cursor-pointer block'}
            style={{
              height: `${viewLineHeight}px`,
              lineHeight: `${viewLineHeight}px`,
              color: index === activeLine ? 'red' : 'unset',
              textDecoration: index === activeLine ? 'underline' : 'unset',
            }}
            key={index}
          >
            {index + 1}
          </a>
        );
      })}
    </div>
  );
};

export default LineNumber;
