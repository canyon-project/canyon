// import { CanyonCardPrimary } from './index.ts';
import { StockOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Row, Space, Statistic, theme, Typography } from 'antd';
const { useToken } = theme;
const { Title } = Typography;
const CanyonCardPrimary = ({ theme, language,children }) => {
  const { token } = useToken();
  return (
    <div
      className={'bg-white rounded-md overflow-hidden'}
      style={{
        border: '1px solid #dfe3e6',
        boxShadow: `${token.boxShadowTertiary}`,
      }}
    >

      {children}
      {/*<Title level={3} className={'p-5'} style={{ marginBottom: '0' }}>*/}
      {/*  <Space>*/}
      {/*    <StockOutlined />*/}
      {/*    EAS Update*/}
      {/*  </Space>*/}
      {/*</Title>*/}
      {/*<div*/}
      {/*  style={{*/}
      {/*    borderBottom: '1px solid #dfe3e6',*/}
      {/*  }}*/}
      {/*/>*/}
      {/*<Row gutter={16} className={'p-5'}>*/}
      {/*  <Col span={12}>*/}
      {/*    <Statistic title='Active Users' value={112893} />*/}
      {/*  </Col>*/}
      {/*  <Col span={12}>*/}
      {/*    <Statistic title='Account Balance (CNY)' value={112893} precision={2} />*/}
      {/*    <Button style={{ marginTop: 16 }} type='primary'>*/}
      {/*      Recharge*/}
      {/*    </Button>*/}
      {/*  </Col>*/}
      {/*</Row>*/}
    </div>
  );
};

export default CanyonCardPrimary;
