import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCoverageMap } from 'istanbul-lib-coverage';
import { createContext } from 'istanbul-lib-report';
import { create } from 'istanbul-reports';
import archiver from 'archiver';
import * as tmp from 'tmp';
import * as fs from 'fs';
import * as path from 'path';
import { GitLabService } from './gitlab.service';
import { CoverageMapForCommitService } from './coverage-map-for-commit.service';
import { ExportReportDto, ExportFormat } from '../dto/export-report.dto';

@Injectable()
export class ReportExportService {
  private readonly logger = new Logger(ReportExportService.name);

  constructor(
    private readonly gitlabService: GitLabService,
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 获取 GitLab 配置
   */
  public async getGitLabCfg() {
    const base = await this.configService.get('INFRA.GITLAB_BASE_URL');
    const token = await this.configService.get('INFRA.GITLAB_PRIVATE_TOKEN');
    if (!base || !token) throw new BadRequestException('GitLab 配置缺失');
    return { base, token };
  }

  /**
   * 导出覆盖率报告
   */
  async exportReport(params: ExportReportDto): Promise<{ filePath: string; fileName: string }> {
    const { provider, repoID, sha, buildTarget, reportProvider, reportID, format } = params;

    this.logger.log(`Starting report export for ${repoID}@${sha}`);

    // 1. 获取 GitLab 配置
    const { base: gitlabUrl, token: gitlabToken } = await this.getGitLabCfg();

    // 2. 获取覆盖率数据
    const coverageMap = await this.coverageMapForCommitService.invoke({
      provider,
      repoID,
      sha,
      buildTarget: buildTarget || '',
      reportProvider,
      reportID,
      filePath: '', // 获取所有文件
    });
    // console.log(coverageMap,'coverageMap')
    if (!coverageMap || Object.keys(coverageMap).length === 0) {
      throw new BadRequestException('No coverage data found for the specified commit');
    }

    // 3. 获取源代码文件（从 GitLab Archive API）
    const sourceFiles = await this.getSourceFiles(gitlabUrl, repoID, sha, gitlabToken, coverageMap);

    // console.log(sourceFiles,'sourceFiles')

    // 3. 创建临时目录
    const tempDir = tmp.dirSync({ unsafeCleanup: true });
    const reportDir = path.join(tempDir.name, 'coverage-report');
    fs.mkdirSync(reportDir, { recursive: true });

    try {
      // 4. 生成报告
      await this.generateReport(coverageMap, sourceFiles, reportDir, format || ExportFormat.HTML);

      // 5. 创建 ZIP 文件
      const zipPath = await this.createZipFile(reportDir, repoID, sha, format || ExportFormat.HTML);

      const fileName = `coverage-report-${repoID}-${sha.substring(0, 8)}-${format}.zip`;

      return {
        filePath: zipPath,
        fileName,
      };
    } catch (error) {
      // 清理临时文件
      tempDir.removeCallback();
      throw error;
    }
  }

  /**
   * 获取源代码文件（仅从 GitLab Archive API）
   */
  private async getSourceFiles(
    gitlabUrl: string,
    projectId: string,
    sha: string,
    token: string,
    coverageMap: any
  ): Promise<Map<string, string>> {
    // 必须有 GitLab 配置才能获取源码
    if (!gitlabUrl || !token) {
      throw new BadRequestException('GitLab 配置缺失，无法获取源代码文件');
    }

    // 验证 GitLab 连接
    const isValid = await this.gitlabService.validateConnection(gitlabUrl, projectId, token);
    if (!isValid) {
      throw new BadRequestException('Invalid GitLab configuration or insufficient permissions');
    }

    // 获取需要的文件路径
    const filePaths = Object.keys(coverageMap);
    this.logger.log(`Downloading project archive and extracting ${filePaths.length} source files`);

    // 使用 archive API 下载整个项目并提取需要的文件
    const gitlabFiles = await this.gitlabService.downloadProjectArchive(
      gitlabUrl,
      projectId,
      sha,
      token,
      filePaths
    );

    // 检查是否所有需要的文件都获取到了
    const missingFiles = filePaths.filter(filePath => !gitlabFiles.has(filePath));
    if (missingFiles.length > 0) {
      this.logger.warn(`Missing source files: ${missingFiles.join(', ')}`);
      // 可以选择抛出错误或继续处理
      // throw new BadRequestException(`无法获取以下源文件: ${missingFiles.join(', ')}`);
    }

    this.logger.log(`Successfully obtained ${gitlabFiles.size}/${filePaths.length} source files`);
    return gitlabFiles;
  }

  /**
   * 生成覆盖率报告
   */
  private async generateReport(
    coverageMap: any,
    sourceFiles: Map<string, string>,
    outputDir: string,
    format: ExportFormat
  ): Promise<void> {
    // 1. 创建临时源码目录
    const sourceDir = tmp.dirSync({ unsafeCleanup: true });
    this.logger.log(`Created temporary source directory: ${sourceDir.name}`);

    try {
      // 2. 将源码文件写入临时目录
      await this.writeSourceFilesToDisk(sourceFiles, sourceDir.name);

      // 3. 创建 Istanbul 覆盖率映射
      const istanbulCoverageMap = createCoverageMap();

      // 4. 添加覆盖率数据（不需要添加 source 字段，Istanbul 会从文件系统读取）
      Object.entries(coverageMap).forEach(([filePath, coverage]: [string, any]) => {
        // 更新文件路径为临时目录中的路径
        const tempFilePath = path.join(sourceDir.name, filePath);
        const updatedCoverage = {
          ...coverage,
          path: tempFilePath, // 指向临时目录中的文件
        };
        console.log(tempFilePath,'tempFilePath')
        istanbulCoverageMap.addFileCoverage(updatedCoverage);
      });

      console.log(Object.values(istanbulCoverageMap.toJSON())[0])
      console.log(Object.keys(istanbulCoverageMap.toJSON())[0])

      // 5. 创建报告上下文
      const context = createContext({
        dir: outputDir,
        coverageMap: istanbulCoverageMap,
        sourceFinder(filepath: string): string {
        }
      });

    // 根据格式生成不同类型的报告
    switch (format) {
      case ExportFormat.HTML:
        const htmlReport = create('@canyonjs/report-html');
        htmlReport.execute(context);
        break;

      case ExportFormat.JSON:
        const jsonReport = create('json');
        jsonReport.execute(context);
        break;

      case ExportFormat.LCOV:
        const lcovReport = create('lcov');
        lcovReport.execute(context);
        break;

      case ExportFormat.COBERTURA:
        const coberturaReport = create('cobertura');
        coberturaReport.execute(context);
        break;

      default:
        throw new BadRequestException(`Unsupported export format: ${format}`);
    }

    // 添加元数据文件
    const metadata = {
      generatedAt: new Date().toISOString(),
      format,
      totalFiles: Object.keys(coverageMap).length,
      sourceFilesFound: sourceFiles.size,
    };

    fs.writeFileSync(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

      this.logger.log(`Generated ${format} report in ${outputDir}`);
    } finally {
      // 6. 清理临时源码目录
      sourceDir.removeCallback();
    }
  }

  /**
   * 将源码文件写入磁盘
   */
  private async writeSourceFilesToDisk(sourceFiles: Map<string, string>, baseDir: string): Promise<void> {
    const writePromises: Promise<void>[] = [];

    sourceFiles.forEach((content, filePath) => {
      const fullPath = path.join(baseDir, filePath);
      const dir = path.dirname(fullPath);

      const writePromise = (async () => {
        try {
          // 确保目录存在
          await fs.promises.mkdir(dir, { recursive: true });

          // 写入文件
          await fs.promises.writeFile(fullPath, content, 'utf8');

          this.logger.debug(`Written source file: ${filePath}`);
        } catch (error) {
          this.logger.error(`Failed to write source file ${filePath}: ${error.message}`);
          throw error;
        }
      })();

      writePromises.push(writePromise);
    });

    // 等待所有文件写入完成
    await Promise.all(writePromises);
    this.logger.log(`Written ${sourceFiles.size} source files to ${baseDir}`);
  }

  /**
   * 创建 ZIP 文件
   */
  private async createZipFile(
    reportDir: string,
    repoID: string,
    sha: string,
    format: ExportFormat
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const zipPath = tmp.tmpNameSync({ postfix: '.zip' });
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        this.logger.log(`ZIP file created: ${zipPath} (${archive.pointer()} bytes)`);
        resolve(zipPath);
      });

      archive.on('error', (err) => {
        this.logger.error(`ZIP creation failed: ${err.message}`);
        reject(err);
      });

      archive.pipe(output);

      // 添加报告文件到 ZIP
      archive.directory(reportDir, false);

      archive.finalize();
    });
  }

  /**
   * 清理临时文件
   */
  async cleanupTempFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Cleaned up temp file: ${filePath}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to cleanup temp file ${filePath}: ${error.message}`);
    }
  }
}
