// import { CanyonCardPrimary } from './index.ts';
import { StockOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Row, Space, Statistic, theme, Typography } from 'antd';
const { useToken } = theme;
const { Title } = Typography;
const CanyonCardPrimary = ({ theme, language, children }) => {
  const { token } = useToken();
  return (
    <div
      className={'rounded-[8px] overflow-hidden'}
      style={{
        border: `1px solid ${token.colorBorder}`,
        boxShadow: `${token.boxShadowTertiary}`,
      }}
    >
      {children}
    </div>
  );
};

export default CanyonCardPrimary;
