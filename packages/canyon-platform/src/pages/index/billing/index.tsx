import {
  ArrowRightOutlined,
  CaretRightOutlined,
  CreditCardOutlined,
  RightOutlined,
  RightSquareOutlined,
} from '@ant-design/icons';
// import {Text} from "echarts/types/src/util/graphic";
// import { CanyonCardPrimary } from './index.ts';
import { StockOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Collapse,
  CollapseProps,
  Descriptions,
  DescriptionsProps,
  Progress,
  Row,
  Space,
  Statistic,
  theme,
  Typography,
} from 'antd';
import { CanyonCardPrimary, CanyonTextTitle } from 'canyon-ui-old';
import { CanyonBillingCollapse, CanyonBillingUpdateCard } from 'canyon-ui-old';
import { CSSProperties } from 'react';
// import {CanyonBillingCollapse} from "canyon-ui-old/";
// import { Button, Col, Divider, Row, Space, Statistic, theme, Typography } from 'antd';
const { useToken } = theme;
// const { Title } = Typography;
const { Title, Text } = Typography;
import { useNavigate } from 'react-router-dom';

import c from './cart.json';
// import {CanyonCardPrimary} from "canyon-ui-old/src";
const items: DescriptionsProps['items'] = [
  {
    key: '1',
    label: 'UserName',
    children: 'Zhou Maomao',
  },
  {
    key: '2',
    label: 'Telephone',
    children: '1810000000',
  },
  {
    key: '3',
    label: 'Live',
    children: 'Hangzhou, Zhejiang',
  },
  {
    key: '4',
    label: 'Remark',
    children: 'empty',
  },
  {
    key: '5',
    label: 'Address',
    children: 'No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China',
  },
];
const Billing = () => {
  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    // backgroundColor: '#f8f9fa',
    // background: token.colorFillAlter,
    borderRadius: 'none',
    border: 'none',
  };
  const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
  const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (panelStyle) => [
    {
      key: '1',
      label: (
        <div className={''}>
          <Title level={4} style={{ marginBottom: '0', fontSize: '16px' }}>
            Free plan
          </Title>
          <Text type={'secondary'}>
            For startups, proofs-of-concept, hobbyists, and student projects.
          </Text>
        </div>
      ),
      children: (
        <div className={'bg-white px-6 py-5 pl-12'}>
          <Descriptions title='User Info' items={items} />
        </div>
      ),
      style: panelStyle,
    },
  ];
  const nav = useNavigate();
  return (
    <div>
      <CanyonTextTitle title={'账单'} icon={<CreditCardOutlined />} />
      <CanyonCardPrimary>
        <div className={'bg-white'}>
          <div className={'flex items-center justify-between px-6 py-4'}>
            <Title level={3} style={{ marginBottom: '0', fontSize: '20px' }}>
              计划
            </Title>

            <Button
              type={'primary'}
              onClick={() => {
                nav('/billing/cart');
              }}
            >
              Subscribe
              <ArrowRightOutlined />
            </Button>
          </div>
          <div
            style={{
              borderBottom: '1px solid #dfe3e6',
            }}
          />
          <CanyonBillingCollapse c={c[0]}></CanyonBillingCollapse>
        </div>
      </CanyonCardPrimary>

      <div className={'h-5'}></div>

      <CanyonCardPrimary>
        <div className={'bg-white'}>
          <Title level={3} className={'p-5'} style={{ marginBottom: '0', fontSize: '20px' }}>
            <Space>
              <StockOutlined />
              流量使用
            </Space>
          </Title>
          <div
            style={{
              borderBottom: '1px solid #dfe3e6',
            }}
          />

          <div className={'flex justify-between px-6 py-5'}>
            <span>Builds</span>

            <div className={'w-[360px]'}>
              <Text type={'secondary'}>已经使用30%，30G流量</Text>
              <Progress percent={30} showInfo={false} />
            </div>

            <span>Included</span>
          </div>
        </div>
      </CanyonCardPrimary>

      <div className={'mb-10'}></div>

      <CanyonBillingUpdateCard></CanyonBillingUpdateCard>
    </div>
  );
};

export default Billing;
