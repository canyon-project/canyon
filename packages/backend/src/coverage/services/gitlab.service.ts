import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as tmp from 'tmp';
import * as archiver from 'archiver';

export interface GitLabFile {
  file_name: string;
  file_path: string;
  content: string;
  encoding: string;
}

@Injectable()
export class GitLabService {
  private readonly logger = new Logger(GitLabService.name);
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 60000, // 增加超时时间，因为要下载zip包
    });
  }

  /**
   * 下载项目源码 ZIP 包并解压获取文件内容
   */
  async downloadProjectArchive(
    gitlabUrl: string,
    projectId: string,
    sha: string,
    token: string,
    filePaths: string[]
  ): Promise<Map<string, string>> {
    try {
      // 1. 下载项目 ZIP 包
      const archiveUrl = `${gitlabUrl}/api/v4/projects/${encodeURIComponent(projectId)}/repository/archive.zip`;
      this.logger.log(`Downloading project archive from: ${archiveUrl}`);
      
      const response = await this.axiosInstance.get(archiveUrl, {
        headers: {
          'Private-Token': token,
        },
        params: {
          sha: sha,
        },
        responseType: 'arraybuffer', // 重要：以二进制方式接收
      });

      // 2. 保存到临时文件
      const tempZipFile = tmp.tmpNameSync({ postfix: '.zip' });
      fs.writeFileSync(tempZipFile, response.data);

      // 3. 解压并读取需要的文件
      const sourceFiles = await this.extractFilesFromZip(tempZipFile, filePaths);

      // 4. 清理临时文件
      fs.unlinkSync(tempZipFile);

      this.logger.log(`Successfully extracted ${sourceFiles.size} files from archive`);
      return sourceFiles;
    } catch (error) {
      this.logger.error(`Failed to download project archive: ${error.message}`);
      throw new BadRequestException(`Failed to download project archive: ${error.message}`);
    }
  }

  /**
   * 从 ZIP 文件中提取指定的文件内容
   */
  private async extractFilesFromZip(zipPath: string, filePaths: string[]): Promise<Map<string, string>> {
    const AdmZip = require('adm-zip');
    const sourceFiles = new Map<string, string>();

    try {
      const zip = new AdmZip(zipPath);
      const zipEntries = zip.getEntries();

      // 创建文件路径的 Set 用于快速查找
      const targetPaths = new Set(filePaths);

      zipEntries.forEach((entry: any) => {
        if (!entry.isDirectory) {
          // GitLab archive 的文件路径通常是 "project-name-sha/path/to/file"
          // 我们需要去掉前缀部分
          const entryPath = entry.entryName;
          const pathParts = entryPath.split('/');
          
          if (pathParts.length > 1) {
            // 去掉第一部分（项目名-sha）
            const relativePath = pathParts.slice(1).join('/');
            
            // 检查是否是我们需要的文件
            if (targetPaths.has(relativePath)) {
              try {
                const content = entry.getData().toString('utf8');
                sourceFiles.set(relativePath, content);
                this.logger.debug(`Extracted file: ${relativePath}`);
              } catch (err) {
                this.logger.warn(`Failed to extract ${relativePath}: ${err.message}`);
              }
            }
          }
        }
      });

      return sourceFiles;
    } catch (error) {
      this.logger.error(`Failed to extract files from ZIP: ${error.message}`);
      throw new BadRequestException(`Failed to extract files from ZIP: ${error.message}`);
    }
  }

  // 保留这些方法作为备用，以防 archive API 不可用时的降级方案
  // /**
  //  * 获取单个文件内容 (备用方法)
  //  */
  // async getFileContent(
  //   gitlabUrl: string,
  //   projectId: string,
  //   filePath: string,
  //   sha: string,
  //   token: string
  // ): Promise<GitLabFile> {
  //   // ... 实现保持不变
  // }

  // /**
  //  * 批量获取多个文件内容 (备用方法)
  //  */
  // async getMultipleFileContents(
  //   gitlabUrl: string,
  //   projectId: string,
  //   filePaths: string[],
  //   sha: string,
  //   token: string
  // ): Promise<Map<string, GitLabFile>> {
  //   // ... 实现保持不变
  // }

  /**
   * 验证 GitLab 连接和权限
   */
  async validateConnection(gitlabUrl: string, projectId: string, token: string): Promise<boolean> {
    try {
      const url = `${gitlabUrl}/api/v4/projects/${encodeURIComponent(projectId)}`;
      await this.axiosInstance.get(url, {
        headers: {
          'Private-Token': token,
        },
      });
      return true;
    } catch (error) {
      this.logger.error(`GitLab connection validation failed: ${error.message}`);
      return false;
    }
  }
}