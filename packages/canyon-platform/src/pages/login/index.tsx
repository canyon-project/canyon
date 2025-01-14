import { useRequest } from "ahooks";
import axios from "axios";
import { CanyonPageLogin } from "../../components/old-ui";

import logo from "../../assets/logo.svg";

const Login2 = () => {
  const { data, loading: isLoading } = useRequest(() =>
    axios.get("/api/base").then(({ data }) => data),
  );
  if (isLoading) {
    return <div>loading</div>;
  }

  return (
    <div id={"login-page"}>
      <CanyonPageLogin
        logo={<img src={logo} className={"w-[36px]"} alt="" />}
        oauthUrl={{
          gitlab: `${data?.GITLAB_URL}/oauth/authorize?response_type=code&state=STATE&scope=api&client_id=${data?.GITLAB_CLIENT_ID}&redirect_uri=${window.location.origin}/oauth`,
        }}
        onLoginSuccess={() => {
          setTimeout(() => {
            window.location.href = "/";
          }, 100);
        }}
      />
    </div>
  );
};

export default Login2;
