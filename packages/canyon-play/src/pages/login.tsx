import { CanyonPageLogin } from 'canyon-ui';
import { useNavigate } from 'react-router-dom';

const Login2 = () => {
  const nav = useNavigate();
  return (
    <div>
      <CanyonPageLogin
        oauthUrl={{
          gitlab: 'https://gitlab.com',
        }}
        onLoginSuccess={() => {
          // 跳转到首页
          // nav('/');
          setTimeout(()=>{
            window.location.href = '/';
          },100)
        }}
      />
    </div>
  );
};

export default Login2;
