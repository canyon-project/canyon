import axios from 'axios';
import * as process from 'node:process';
import { suffixMap } from '../../../common/suffix';

export class PullFilePathAndInsertDbService {
  async invoke(projectID, sha, prisma) {
    const filepathCount = await prisma.filepath.count({
      where: {
        projectID,
        sha,
      },
    });
    if (filepathCount === 0) {
      const suffix = await prisma.project
        .findFirst({
          where: {
            id: projectID,
          },
        })
        .then((project) => (project ? suffixMap[project.language] : []));
      // 配置
      const accessToken = process.env['PRIVATE_TOKEN']; // 替换为你的访问令牌
      const projectId = projectID.split('-')[1]; // 替换为你的项目ID或URL编码的项目路径
      const baseUrl = `${process.env['GITLAB_URL']}/api/v4/projects/${projectId}/repository/tree`;

      // 初始请求参数
      const headers = {
        'PRIVATE-TOKEN': accessToken,
        ref: sha,
      };
      const params = {
        recursive: false, //不递归
        per_page: 500, // 限制每页最多500个文件
      };
      const fileList = await this.getFileList(suffix, baseUrl, headers, params);
      const data = fileList.map((path) => {
        return {
          projectID,
          sha,
          path,
        };
      });
      await prisma.filepath.createMany({
        data: data,
      });
    }
  }

  // 获取完整文件列表的函数
  async getFileList(suffix, url, headers, params, files = []) {
    try {
      const response = await axios.get(url, { headers, params });
      const items = response.data;

      for (const item of items) {
        if (item.type === 'blob') {
          // 文件

          if (suffix.some((suffix) => item.path.endsWith(suffix))) {
            files.push(item.path);
          }
        } else if (item.type === 'tree') {
          // 目录
          // 递归调用以获取目录中的文件
          const newParams = { ...params, path: item.path };
          await this.getFileList(suffix, url, headers, newParams, files);
        }
      }
    } catch (error) {
      console.error(
        `Failed to get file list: ${error.response.status}, ${error.response.statusText}`,
      );
    }
    return files;
  }
}
