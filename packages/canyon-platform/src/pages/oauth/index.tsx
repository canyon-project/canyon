import { CanyonPageOauth } from "../../components/old-ui";
import { useNavigate, useSearchParams } from "react-router-dom";

const Oauth = () => {
  const [URLSearchParams] = useSearchParams();
  const nav = useNavigate();
  return (
    <div>
      <CanyonPageOauth
        URLSearchParams={URLSearchParams}
        onOauthFail={() => {
          localStorage.clear();
          nav("/login");
        }}
      />
    </div>
  );
};

export default Oauth;
