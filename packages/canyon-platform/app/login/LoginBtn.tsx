import { FC } from "react";

// import github from "../../../../../assets/img/github.svg";
// import gitlab from "../../../../../assets/img/gitlab.svg";
// import google from "../../../../../assets/img/google.svg";
import { Button } from "antd";
import { signIn } from "next-auth/react";
import Image from "next/image";
// import img from '../../../../../assets/img/img.png';

const LoginBtn: FC<{
  oauthUrl: { google?: string; github?: string; gitlab?: string };
}> = ({ oauthUrl }) => {
  return (
    <div
      className={
        "flex flex-col gap-3 w-[250px] items-center justify-around py-10 pl-5"
      }
    >
      <Button
        type="default"
        className={"w-full text-left"}
        disabled={!oauthUrl.google}
      >
        <Image width={14} height={14} src={`/providers/google.svg`} alt={""} />
        {/*<img src={google} alt="" className={"w-[14px] mr-2 mt-[-2px]"} />*/}
        Sign in with Google
      </Button>
      <Button
        type="default"
        className={"w-full text-left"}
        onClick={() => {
          return signIn("github");
        }}
        // disabled={!oauthUrl.github}
      >
        {/*<img src={github} alt="" className={"w-[14px] mr-2 mt-[-2px]"} />*/}
        <Image width={14} height={14} src={`/providers/github.svg`} alt={""} />
        Sign in with Github
      </Button>

      <Button
        type="default"
        className={"w-full text-left"}
        onClick={() => {
          return signIn("gitlab");
        }}
      >
        {/*<img src={gitlab} alt="" className={"w-[14px] mr-2 mt-[-2px]"} />*/}
        <Image width={14} height={14} src={`/providers/gitlab.svg`} alt={""} />
        Sign in with Gitlab
      </Button>
    </div>
  );
};
export default LoginBtn;
