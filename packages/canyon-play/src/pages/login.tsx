import { CanyonPageLogin } from 'canyon-ui';
import {useNavigate} from "react-router-dom";

const Login2 = () => {
  const nav = useNavigate();
  return (
    <div>
      <CanyonPageLogin onLoginSuccess={()=>{
        // 跳转到首页
        nav('/')
      }} />
    </div>
  );
};

export default Login2;
