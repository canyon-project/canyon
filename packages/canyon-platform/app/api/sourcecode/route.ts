import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const projectID = searchParams.get("project_id");
  const sha = searchParams.get("sha");
  const filepath = searchParams.get("filepath");
  // console.log(projectID, sha, filepath);
  // 必须projectID、sha、filepath都存在
  if (!projectID || !sha || !filepath) {
    return Response.error();
  }
  const [provider, id, slug] = projectID.split("-");
  // console.log('?????')
  const gitProvider = await prisma.gitProvider.findFirst({
    where: {
      id: provider,
    },
  });
  // console.log(gitProvider,'gitProvider')
  if (gitProvider) {
    // TODO: 从gitlab获取文件内容，还去要判断provider type，例如github。
    // 判断provider类型，例如gitlab、github、gitea

    // console.log(gitProvider.type,'gitProvider.type')
    switch (gitProvider.type) {
      case "gitlab":
        const { url: gitlabUrl, privateToken: gitlabPrivateToken } =
          gitProvider;
        const gitlabResponse = await axios
          .get(
            `${gitlabUrl}/api/v4/projects/${id}/repository/files/${filepath}`,
            {
              params: {
                ref: sha,
              },
              headers: {
                "private-token": gitlabPrivateToken,
              },
            },
          )
          .then(({ data }) => data);
        return Response.json(gitlabResponse);
      case "github":
        const { url: githubUrl, privateToken: githubPrivateToken } =
          gitProvider;
        // 对于github，其认证一般是通过Authorization头部带上token，格式为"Bearer <token>"
        console.log(
          `${"https://api.github.com"}/repos/${id}/contents/${"packages/canyon-report/" + filepath}`,
          sha,
        );
        const githubResponse = await axios
          .get(
            `${"https://api.github.com"}/repos/${id}/contents/${"packages/canyon-report/" + filepath}`,
            {
              // 注意这里params中ref要改为branch，因为github API此处参数名是branch（假设你传入的sha对应的是分支名情况）
              params: {
                ref: sha,
              },
              headers: {
                "private-token": `${githubPrivateToken}`,
              },
            },
          )
          .then(({ data }) => data);
        return Response.json(githubResponse);
      case "gitea":
        break;
      default:
        return Response.error();
    }
  } else {
    return Response.error();
  }
}
