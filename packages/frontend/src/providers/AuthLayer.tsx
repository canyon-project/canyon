import { Button } from 'antd';
import { useAuthGate } from '@/helpers/login';

/** 鉴权层：未登录仅展示登录按钮，已登录或校验中由 login 逻辑处理 */
export function AuthLayer({ children }: { children: React.ReactNode }) {
  const { status, goLogin } = useAuthGate();

  if (status === 'authenticated') return <>{children}</>;
  if (status === 'validating') {
    return <div style={{ padding: 24, textAlign: 'center' }}>登录校验中...</div>;
  }

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <Button type="primary" onClick={goLogin}>登录</Button>
    </div>
  );
}
