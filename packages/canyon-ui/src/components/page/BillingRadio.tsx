import { CheckCircleFilled } from '@ant-design/icons';
import { Button, ConfigProvider, theme } from 'antd';
import { useState } from 'react';
const { useToken } = theme;
const CanyonBillingRadio = ({ isAciti, onSelect }) => {
  const { token } = useToken();
  // const [count, setCount] = useState(0);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#327652',
        },
      }}
    >
      <Button
        onClick={(e) => {
          onSelect();
          e.stopPropagation();
        }}
        style={{ backgroundColor: isAciti ? 'rgb(235, 248, 239)' : 'white' }}
        type={isAciti ? 'primary' : 'default'}
        ghost={isAciti}
      >
        <div className={'flex items-center gap-3'}>
          <span>$99/month</span>
          {!isAciti ? (
            <div
              className={'h-[14px] w-[14px] rounded-[7px] inline-block'}
              style={{ border: `1.5px solid ${token.colorBorder}` }}
            ></div>
          ) : (
            <CheckCircleFilled />
          )}
        </div>
      </Button>
    </ConfigProvider>
  );
};

export default CanyonBillingRadio;
