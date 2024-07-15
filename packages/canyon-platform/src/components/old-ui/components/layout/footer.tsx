const AppFooter = ({ name, corp }) => {
  return (
    <footer className={'mx-auto w-[1250px] px-6 pb-20 pt-16'}>
      <div style={{ fontSize: '20px', fontWeight: 'bolder', marginBottom: '20px' }}>{name}</div>
      Copyright © 2024 {corp}, Inc. All rights reserved.
    </footer>
  );
};

export default AppFooter;
