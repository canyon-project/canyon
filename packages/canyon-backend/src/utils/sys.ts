const obj = {
  GITLAB_CLIENT_ID: "gitlabClientID",
  GITLAB_CLIENT_SECRET: "gitlabClientSecret",
  GITLAB_SERVER: "gitlabServer",
  DOCS_LINK: "docsLink",
  UNPKG_URL: "unpkgUrl",
};
export const convertSystemSettingsFromTheDatabase = (
  settings,
): {
  gitlabClientSecret: string;
  gitlabClientID: string;
  gitlabServer: string;
  docsLink: string;
  canyonServer: string;
  unpkgUrl: string;
} => {
  const map = {
    gitlabClientSecret: "",
    gitlabClientID: "",
    gitlabServer: "",
    docsLink: "",
    canyonServer: "",
    unpkgUrl: "",
  };
  settings.forEach((setting) => {
    map[obj[setting.key]] = setting.value;
  });
  return map;
};
