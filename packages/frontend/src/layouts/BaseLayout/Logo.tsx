const Logo = () => {
  return (
    <div className={'flex items-center p-[14px]'}>
      <div className={'flex items-center justify-between'}>
        <div
          className={'cursor-pointer flex items-center'}
          style={{ marginBottom: 0 }}
          onClick={() => {
            window.location.href = '/';
          }}
        >
          <img src="/logo.svg" alt="" className={'w-[32px]'} />
          <span
            className={'ml-[6px]'}
            style={{
              fontSize: '18px',
              fontWeight: 'bolder',
            }}
          >
            {'Canyon'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;
