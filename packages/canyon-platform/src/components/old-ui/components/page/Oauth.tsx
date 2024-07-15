import { message, Spin } from 'antd';
import { useEffect } from 'react';

const CanyonPageOauth = ({ URLSearchParams, onOauthFail }) => {
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
          onOauthFail();
        } else {
          localStorage.setItem('token', res.token);
          window.location.href = localStorage.getItem('callback') || '/';
        }
      });
  useEffect(() => {
    fetcher('/api/oauth/token');
  }, []);

  return <Spin spinning={true}>logging in...</Spin>;
};

export default CanyonPageOauth;
