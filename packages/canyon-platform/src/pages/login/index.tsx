import { useRequest } from 'ahooks';
import axios from 'axios';
import { CanyonPageLogin } from 'canyon-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import logo from '../../assets/light-logo.svg';

const Login2 = () => {
  const nav = useNavigate();
  const { t } = useTranslation();
  const { data, loading: isLoading } = useRequest(() =>
    axios.get('/api/base').then(({ data }) => data),
  );
  if (isLoading) {
    return <div>loading</div>;
  }

  return (
    <div>
      <CanyonPageLogin
        logo={<img src={logo} className={'w-[36px]'} alt='' />}
        oauthUrl={{
          gitlab: `${data?.GITLAB_URL}/oauth/authorize?response_type=code&state=STATE&scope=api&client_id=${data?.GITLAB_CLIENT_ID}&redirect_uri=${window.location.origin}/oauth`,
        }}
        onLoginSuccess={() => {
          // 跳转到首页
          // nav('/');
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        }}
      />
    </div>
  );
};

export default Login2;
