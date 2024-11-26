import axios from "axios";

// 用于文件base64解码后的格式化
function getDecode(str: string) {
  return decodeURIComponent(
    atob(str)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );
}
export const handleSelect = async ({
  projectID,
  sha,
  filepath,
}: {
  projectID: string;
  sha: string;
  filepath: string;
}) => {
  // TODO 要改，判断文件的逻辑
  if (!filepath.includes(".")) {
    return Promise.resolve({
      fileCoverage: {},
      fileContent: "",
    });
  }
  const [coverage, sourcecode] = await Promise.all([
    axios
      .get("/api/cov/map", {
        params: {
          project_id: projectID,
          sha,
          filepath,
        },
      })
      .then((res) => res.data),
    axios
      .get("/api/sourcecode", {
        params: {
          project_id: projectID,
          sha,
          filepath,
        },
      })
      .then((res) => res.data)
      .catch(() => {
        return {
          content: "",
        };
      }),
  ]);
  console.log(coverage[filepath], coverage, filepath, "coverage[filepath]");
  return {
    // @ts-ignore
    fileCoverage: coverage[filepath],
    fileContent: getDecode(sourcecode.content),
  };
};
