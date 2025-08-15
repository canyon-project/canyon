import { Space, Typography, theme } from 'antd';

const { useToken } = theme;
const { Text } = Typography;
const AppDataLayout = ({ label, value }: any) => {
  const { token } = useToken();
  return (
    <div>
      <Space>
        <Space style={{ fontSize: '14px', color: token.colorTextSecondary }}>
          {label}
          <span>:</span>
        </Space>
        <Text>{value}</Text>
      </Space>
    </div>
  );
};

export default AppDataLayout;
