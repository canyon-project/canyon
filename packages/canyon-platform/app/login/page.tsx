"use client";
import Icon from "@ant-design/icons";
import { FC } from "react";

// import { EpTopRight } from "../../../../../assets/icons/EpTopRight.tsx";
// import img from "../../../../../assets/img/img.png";
// import { CanyonCardPrimary } from "../../card";
import LoginBtn from "./LoginBtn";
import LoginForm from "./LoginForm";
import { Divider, Tabs, Typography } from "antd";
import { CanyonCardPrimary } from "@/components/wget/card";
import { EpTopRight } from "@/components/EpTopRight";
import WithTheme from "@/theme";
import Image from "next/image";

const { Title } = Typography;

const CanyonPageLogin: FC<{
  // onLoginSuccess: () => void;
  // oauthUrl: { gitlab: string };
  // logo: React.ReactNode;
  // register?: string;
}> = () => {
  const { onLoginSuccess, oauthUrl, logo, register } = {
    onLoginSuccess: () => {},
    oauthUrl: { gitlab: "" },
    logo: "",
    register: "",
  };
  return (
    <div className={"w-full relative"}>
      <div className={"m-auto w-[680px] pt-20"}>
        <CanyonCardPrimary>
          <div className={"flex"}>
            <div className={"bg-blue-950 w-[60px] flex justify-center pt-5"}>
              <Title level={2} className={""} style={{ color: "white" }}>
                <Image width={45} height={45} src={`/logo.svg`} alt={""} />
              </Title>
            </div>

            <div className={"bg-white flex-1"}>
              <div className={"px-10 pt-5"}>
                <Title level={3}>Log in and continue123</Title>
              </div>
              <Tabs
                tabBarExtraContent={
                  register && (
                    <div className={"pr-5"}>
                      <a href={register} target={"_blank"} rel="noreferrer">
                        Register
                        <Icon component={EpTopRight} />
                      </a>
                    </div>
                  )
                }
                items={[
                  {
                    label: "Sign In",
                    key: "login",
                    children: (
                      <div className={"flex px-10 py-5"}>
                        <LoginForm onLoginSuccess={onLoginSuccess}></LoginForm>
                        <Divider
                          type={"vertical"}
                          style={{ height: "200px" }}
                        />
                        <LoginBtn oauthUrl={oauthUrl} />
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </CanyonCardPrimary>
      </div>

      <div
        className={"absolute top-0 flex flex-wrap h-[100vh] w-full"}
        style={{
          zIndex: "-100",
          // backgroundImage: `url(${img})`,
          backgroundSize: "20%",
          opacity: ".5",
        }}
      ></div>
    </div>
  );
};

export default () => WithTheme(<CanyonPageLogin />);
