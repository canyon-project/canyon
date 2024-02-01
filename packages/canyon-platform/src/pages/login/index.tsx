import { message, Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
const Login = () => {
  const nav = useNavigate();
  const [URLSearchParams] = useSearchParams();
  const fetcher = (url: string) =>
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: URLSearchParams.get('code'),
        redirectUri: location.origin + '/login',
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.statusCode >= 400) {
          message.error(res.message);
          localStorage.clear();
          nav('/welcome');
        } else {
          localStorage.setItem('token', res.token);
          window.location.href = localStorage.getItem('callback') || '/';
        }
      });
  const { isLoading } = useSWR('/api/oauth/token', fetcher);
  return <Spin spinning={isLoading}>Logging in...</Spin>;
};

export default Login;
