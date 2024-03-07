import { Space, Typography } from 'antd';

import CanyonCardPrimary from '../card/Primary.tsx';
const { Title } = Typography;
const CanyonTextTitle = ({ title, icon, right }) => {
  // #687076
  return (
    <div className={'flex justify-between items-center mb-5'}>
      <Title level={1} style={{ fontSize: '25px' }}>
        <Space>
          <span className={'text-[#687076] text-[32px]'}>{icon}</span>
          {title}
        </Space>
      </Title>
      <div>{right}</div>
    </div>
  );
};

export default CanyonTextTitle;
