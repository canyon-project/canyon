"use client";
import { SettingOutlined } from "@ant-design/icons";
// import { TextTypography } from "../../../components/ui";
// import { div } from "../../../components/old-ui";
// import copy from "copy-to-clipboard";
// import { useTranslation } from "react-i18next";

// import languages from "../../../../languages.json";
// import Faa from "./components/BindGitProvider.tsx";
// import { useRequest } from "ahooks";
import axios from "axios";
import { Card, Input, message, Select } from "antd";
import { TextTypography } from "@/components/wget";
import { useLocale, useTranslations } from "next-intl";
import MainBox from "@/components/wget/layout/main-box";
import WithTheme from "@/theme";
import useSWR from "swr";
import { useEffect, useState } from "react";
const TextArea = Input.TextArea;
const gridStyle: any = {
  width: "100%",
};
const Settings = () => {
  const locale = useLocale();
  const [theme, setTheme] = useState();
  // const { data, error, isLoading } = useSWR("/api/cookie", fetcher);
  const t = useTranslations();
  const { data } = {
    data: {
      CANYON_SERVER: "http://localhost:8000",
    },
  };
  useEffect(() => {
    setTheme(localStorage.getItem("theme") || "light");
  }, []);
  return (
    <MainBox>
      <TextTypography title={t("menus.settings")} icon={<SettingOutlined />} />
      <div>
        <Card title={t("settings.preference")} bordered={false}>
          <Card.Grid hoverable={false} style={gridStyle}>
            <div className={"flex"}>
              <div className={"w-1/2"}>{t("common.language")}</div>

              <div className={"w-1/2"}>
                <Select
                  value={locale}
                  onChange={(value) => {
                    // window.location.reload();
                    axios
                      .post("/api/cookie", {
                        name: "locale",
                        value: value,
                      })
                      .then(() => {
                        window.location.reload();
                      });
                  }}
                  options={[
                    {
                      name: "中文",
                      code: "cn",
                    },
                    {
                      name: "English",
                      code: "en",
                    },
                  ].map((item) => {
                    return {
                      label: item.name,
                      value: item.code,
                    };
                  })}
                  className={"w-[100%]"}
                />
              </div>
            </div>
          </Card.Grid>

          <Card.Grid hoverable={false} style={gridStyle}>
            <div className={"flex"}>
              <div className={"w-1/2"}>{t("common.theme")}</div>

              <div className={"w-1/2"}>
                <Select
                  value={theme}
                  onChange={(value) => {
                    localStorage.setItem("theme", value);
                    window.location.reload();
                  }}
                  options={[
                    {
                      label: t("common.light"),
                      value: "light",
                    },
                    {
                      label: t("common.dark"),
                      value: "dark",
                    },
                  ]}
                  className={"w-[100%]"}
                />
              </div>
            </div>
          </Card.Grid>
        </Card>
      </div>
      <div className={"h-5"}></div>
      <div>
        <Card title={t("settings.user_auth_tokens")} bordered={false}>
          <TextArea
            onClick={() => {
              message.success("Copied to clipboard!");
            }}
            value={""}
            readOnly
          />
        </Card>
      </div>
      <div className={"h-5"}></div>
      <div>
        <Card title={"Canyon服务接口地址"} bordered={false}>
          <Input
            onClick={() => {
              // copy(data?.CANYON_SERVER || "");
              message.success("Copied to clipboard!");
            }}
            value={data?.CANYON_SERVER || ""}
            readOnly
          />
        </Card>
      </div>
      <div className={"h-5"}></div>
    </MainBox>
  );
};

export default () => WithTheme(<Settings />);
