import { Space, Typography } from 'antd';

import CanyonCardPrimary from '../card/Primary.tsx';
const { Title } = Typography;
const CanyonTextTitle = ({ title, icon }) => {
  // #687076
  return (
    <Title level={1} style={{ fontSize: '25px' }}>
      <Space>
        <span className={'text-[#687076]'}>{icon}</span>
        {title}
      </Space>
    </Title>
  );
};

export default CanyonTextTitle;
