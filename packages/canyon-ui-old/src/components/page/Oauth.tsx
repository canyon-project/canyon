import { message, Spin } from 'antd';
import { useEffect, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import useSWR from 'swr';
const CanyonPageOauth = ({ URLSearchParams, onOauthFail }) => {
  // const nav = useNavigate();
  // const [URLSearchParams] = useSearchParams();
  const fetcher = (url: string) =>
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: URLSearchParams.get('code'),
        redirectUri: location.origin + '/oauth',
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.statusCode >= 400) {
          message.error(res.message);
          localStorage.clear();
          // nav('/welcome');
          onOauthFail();
        } else {
          localStorage.setItem('token', res.token);
          window.location.href = localStorage.getItem('callback') || '/';
        }
      });
  // const { isLoading } = useSWR('/api/oauth/token', fetcher);

  // const [isLoading,setIsLoading] = useState(true)

  useEffect(() => {
    fetcher('/api/oauth/token');
  }, []);

  return <Spin spinning={true}>logging in...</Spin>;
};

export default CanyonPageOauth;
