import { useEffect, useState } from 'react';
import { Button, Card, message, Spin } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth';
import { useErrorHandler } from '../hooks/useErrorHandler';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();

  // 处理GitHub OAuth回调
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    if (error) {
      message.error(`GitHub 授权失败: ${error}`);
      // 清除URL参数
      navigate('/login', { replace: true });
      return;
    }
    
    if (code && state) {
      handleGitHubCallback(code, state);
    }
  }, [searchParams, navigate]);

  const handleGitHubCallback = async (code: string, state: string) => {
    setLoading(true);
    try {
      const response = await authService.handleGitHubCallback(code, state);
      
      // 存储token和用户信息
      authService.storeAuthData(response.token, response.user);
      
      message.success(`欢迎，${response.user.name || response.user.username}！`);
      
      // 清除URL参数并跳转
      navigate('/', { replace: true });
    } catch (error: any) {
      handleError(error, 'GitHub登录失败，请重试');
      // 清除URL参数
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      const response = await authService.getGitHubLoginUrl();
      window.location.href = response.url;
    } catch (error: any) {
      handleError(error, '获取登录链接失败，请重试');
      setLoading(false);
    }
  };

  // 如果已经登录，重定向到首页
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-6">登录到 Canyon</h1>
          
          {loading ? (
            <div className="py-8">
              <Spin size="large" />
              <p className="mt-4 text-gray-600">
                {searchParams.get('code') ? '正在验证授权信息...' : '正在跳转到 GitHub...'}
              </p>
            </div>
          ) : (
            <Button
              type="primary"
              size="large"
              icon={<GithubOutlined />}
              onClick={handleGitHubLogin}
              className="w-full"
            >
              使用 GitHub 登录
            </Button>
          )}
          
          <p className="mt-4 text-sm text-gray-600">
            点击登录即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;