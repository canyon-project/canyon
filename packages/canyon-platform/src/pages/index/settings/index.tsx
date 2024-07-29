import { SettingOutlined } from "@ant-design/icons";
import { TextTypography } from "../../../components/ui";
import { CanyonCardPrimary } from "../../../components/old-ui";
import copy from "copy-to-clipboard";
import { useTranslation } from "react-i18next";

import languages from "../../../../languages.json";
import Faa from "./components/BindGitProvider.tsx";
const TextArea = Input.TextArea;
const gridStyle: any = {
  width: "100%",
};
const Settings = () => {
  const { t } = useTranslation();
  return (
    <>
      <TextTypography title={t("menus.settings")} icon={<SettingOutlined />} />
      <CanyonCardPrimary>
        <Card title={t("settings.preference")} bordered={false}>
          <Card.Grid hoverable={false} style={gridStyle}>
            <div className={"flex"}>
              <div className={"w-1/2"}>{t("common.language")}</div>

              <div className={"w-1/2"}>
                <Select
                  value={localStorage.getItem("language") || "cn"}
                  onChange={(value) => {
                    localStorage.setItem("language", value);
                    window.location.reload();
                  }}
                  options={languages.map((item) => {
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
                  value={localStorage.getItem("theme") || "light"}
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
      </CanyonCardPrimary>
      <div className={"h-5"}></div>
      <CanyonCardPrimary>
        <Card title={t("settings.user_auth_tokens")} bordered={false}>
          <TextArea
            onClick={() => {
              copy(localStorage.getItem("token") || "");
              message.success("Copied to clipboard!");
            }}
            value={localStorage.getItem("token") || ""}
            readOnly
          />
        </Card>
      </CanyonCardPrimary>
      <div className={"h-5"}></div>
      {localStorage.getItem("debug") === "true" && <Faa />}
    </>
  );
};

export default Settings;
