import {Button, Typography} from 'antd';
// import {Text} from "echarts/types/src/util/graphic";
const { Title, Text } = Typography;
const CanyonBillingUpdateCard = () => {
  return (
    <div className={'mt-4 rounded-lg bg-[#E3F0FE] p-6'}>
      <Title level={4}>订阅用户可以获得更快速的支持</Title>
      <Text className={''}>
        订阅 Arex 计划，利用 Arex 生产和 Arex 企业的这些附加功能改进您的工作流程。
      </Text>

      <div className={'mb-5'}>

      </div>

      <div className={'grid grid-cols-2 gap-6'}>
        {[1, 2].map((i) => {
          return (
            <div style={{
              border:'1px solid #cee7fe',
            }} className={'flex flex-col rounded-lg bg-[#F6FAFF] p-6'}>
              <Title level={5}>Arex Production</Title>
              <Text className={'py-5'}>适用于任何需要生产级服务的项目。</Text>
              <ul className={'grid gap-2'}>
                <li>Everything from the Free plan</li>
                <li>Priority builds</li>
                <li>2 concurrent builds</li>
              </ul>

              <div className={'text-right'}>
                <Button type={'primary'}>Update</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CanyonBillingUpdateCard;
