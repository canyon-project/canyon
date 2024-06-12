import Icon, { ArrowRightOutlined, CheckCircleFilled, CheckCircleTwoTone } from '@ant-design/icons';
import { Button, ConfigProvider, Space, theme, Typography } from 'antd';
import { CanyonBillingCollapse, CanyonBillingRadio } from 'canyon-ui-old';
import { CanyonCardPrimary } from 'canyon-ui-old';
import { useState } from 'react';

import cart from './cart.json';
const { Text } = Typography;
// import {Text} from "echarts/types/src/util/graphic";
// console.log(ss,'ss')
const { useToken } = theme;
const TestBtn = () => {
  return (
    <Button style={{ backgroundColor: 'white' }} type='primary' ghost>
      $99/month
    </Button>
  );
};
const BillingCart = () => {
  const { token } = useToken();
  const [value, setValue] = useState(0);
  const [count, setCount] = useState(0);
  return (
    <div>
      <Space.Compact direction='vertical' className={'mb-3'}>
        <Text style={{ fontSize: '16px' }}>Choose a plan</Text>

        <Text type={'secondary'}>Get the most out of EAS with a monthly plan.</Text>
      </Space.Compact>

      <div className={'grid gap-5'}>
        {cart.map((c,index) => {
          return (
            <CanyonCardPrimary>
              <CanyonBillingCollapse
                c={c}
                kuozhan={
                  <CanyonBillingRadio
                    isAciti={value === index}
                    onSelect={() => {
                      setValue(index);
                    }}
                  />
                }
              />
            </CanyonCardPrimary>
          );
        })}
      </div>

      <div className={'mb-10'}></div>

      <Space.Compact direction='vertical' className={'mb-3'}>
        <Text style={{ fontSize: '16px' }}>Choose a plan</Text>

        <Text type={'secondary'}>Get the most out of EAS with a monthly plan.</Text>
      </Space.Compact>

      <CanyonCardPrimary>
        <div className={'p-5 bg-white'}>
          <div>
            <h3>Usage-based pricing</h3>
            <p>Usage above what's included in each plan is charged at the following rates.</p>
          </div>

          <div>
            <p>EAS Build</p>
            <div>
              <p>Android medium worker</p>
              <p>$1 per build</p>
            </div>

            <div>
              <p>Android medium worker</p>
              <p>$1 per build</p>
            </div>
          </div>
        </div>
      </CanyonCardPrimary>

      <div className={'text-right py-8'}>
        <Button type={'primary'}>
          Continue to Review
          <ArrowRightOutlined />
        </Button>
      </div>
    </div>
  );
};

export default BillingCart;
