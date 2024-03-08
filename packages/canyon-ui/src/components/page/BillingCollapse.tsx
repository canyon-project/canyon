import { RightOutlined } from '@ant-design/icons';
import { Collapse, CollapseProps, Descriptions, DescriptionsProps, Typography } from 'antd';
import { CSSProperties } from 'react';
const { Title, Text } = Typography;
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
const CanyonBillingCollapse = ({ kuozhan, c }) => {
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
        <div className={'flex justify-between'}>
          <div>
            <Title level={4} style={{ marginBottom: '0', fontSize: '16px' }}>
              {c.title}
            </Title>
            <Text type={'secondary'}>{c.desc}</Text>
          </div>
          {kuozhan}
        </div>
      ),
      children: (
        <div className={'bg-white px-6 py-5 pl-12 '}>
          <div className={'grid gap-6'}>
            {c.details.map((d) => {
              return (
                <div className={''}>
                  <div className={'mb-1'}>
                    <Text>{d.title}</Text>
                  </div>
                  <div className={'grid gap-1'}>
                    {d.items.map((i) => {
                      return (
                        <div className={'flex'}>
                          <Text type={'secondary'} className={'flex-1'}>
                            {i.key}
                          </Text>
                          <Text type={'secondary'} className={'flex-1'}>
                            {i.value}
                          </Text>
                        </div>
                      );
                    })}
                  </div>
                  {/*<p>{JSON.stringify(d.items)}</p>*/}
                </div>
              );
            })}
          </div>
        </div>
      ),
      style: panelStyle,
    },
  ];

  return (
    <div>
      <Collapse
        style={{ borderRadius: 'none' }}
        bordered={false}
        defaultActiveKey={['1']}
        expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
        // style={{ background: token.colorBgContainer }}
        items={getItems(panelStyle)}
      />
    </div>
  );
};

export default CanyonBillingCollapse;
