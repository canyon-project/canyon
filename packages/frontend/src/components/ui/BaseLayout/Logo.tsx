import type { FC } from 'react';

const Logo: FC<{
  logo: React.ReactNode;
}> = ({ logo }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            marginBottom: 0,
          }}
          onClick={() => {
            window.location.href = '/';
          }}
        >
          {logo}
          <span
            style={{
              marginLeft: '6px',
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
