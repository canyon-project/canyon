const obj = {
  GITLAB_CLIENT_ID: "gitlabClientID",
  GITLAB_CLIENT_SECRET: "gitlabClientSecret",
  GITLAB_SERVER: "gitlabServer",
  DOCS_LINK: "docsLink",
};
export const convertSystemSettingsFromTheDatabase = (
  settings,
): {
  gitlabClientSecret: string;
  gitlabClientID: string;
  gitlabServer: string;
  docsLink: string;
} => {
  const map = {
    gitlabClientSecret: "",
    gitlabClientID: "",
    gitlabServer: "",
    docsLink: "",
  };
  settings.forEach((setting) => {
    map[obj[setting.key]] = setting.value;
  });
  return map;
};
