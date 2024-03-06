import {
  ArrowRightOutlined,
  CaretRightOutlined,
  CreditCardOutlined,
  RightOutlined,
  RightSquareOutlined,
} from '@ant-design/icons';
import {Button, Collapse, CollapseProps, Descriptions, DescriptionsProps, Typography} from 'antd';
import { CanyonCardPrimary, CanyonTextTitle } from 'canyon-ui';
import { CSSProperties } from 'react';
// import {Text} from "echarts/types/src/util/graphic";
const { Title,Text } = Typography;
// import {CanyonCardPrimary} from "canyon-ui/src";
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
    // background: token.colorFillAlter,
    // borderRadius: token.borderRadiusLG,
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
          <Text type={'secondary'}>For startups, proofs-of-concept, hobbyists, and student projects.</Text>
        </div>
      ),
      children: <div className={'bg-white px-6 py-5 pl-12'}>

        <Descriptions title="User Info" items={items} />

      </div>,
      style: panelStyle,
    }
  ];
  return (
    <div>
      <CanyonTextTitle title={'Billing'} icon={<CreditCardOutlined />} />
      <CanyonCardPrimary>
        <div className={'flex items-center justify-between px-6 py-4'}>
          <Title level={3} style={{ marginBottom: '0', fontSize: '20px' }}>
            Plan
          </Title>

          <Button type={'primary'}>
            Subscribe
            <ArrowRightOutlined />
          </Button>
        </div>
        <div
          style={{
            borderBottom: '1px solid #dfe3e6',
          }}
        />
        <Collapse
          bordered={false}
          defaultActiveKey={['1']}
          expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
          // style={{ background: token.colorBgContainer }}
          items={getItems(panelStyle)}
        />
      </CanyonCardPrimary>
    </div>
  );
};

export default Billing;
