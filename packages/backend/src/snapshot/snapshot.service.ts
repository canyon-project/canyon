import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import archiver from 'archiver';
import { createCoverageMap } from 'istanbul-lib-coverage';
import { createContext } from 'istanbul-lib-report';
import { create } from 'istanbul-reports';
import * as tmp from 'tmp';
import { CodeService } from '../code/service/code.service';
import { CoverageMapForCommitService } from '../coverage/services/coverage-map-for-commit.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateSnapshotDto } from './dto/create-snapshot.dto';
import type { UpdateSnapshotDto } from './dto/update-snapshot.dto';

/** 生成假产物：占位 zip 内容（PK 头 + 空内容） */
function createFakeArtifact(): Buffer {
  const centralHeader = Buffer.alloc(0);
  const endRecord = Buffer.from([
    0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
  return Buffer.concat([centralHeader, endRecord]);
}

const FAKE_ARTIFACT = createFakeArtifact();
const FAKE_ARTIFACT_SIZE = FAKE_ARTIFACT.length;

/** 尝试将 GitLab/GitHub API 返回的 base64 内容解码为 UTF-8 */
function decodeFileContent(content: string | null): string {
  if (!content) return '';
  try {
    return Buffer.from(content, 'base64').toString('utf8');
  } catch {
    return content;
  }
}

@Injectable()
export class SnapshotService {
  private readonly logger = new Logger(SnapshotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
    private readonly codeService: CodeService,
  ) {}

  /**
   * 生成 HTML 覆盖率报告并打成 zip，数据来源：
   * - 覆盖率：CoverageMapForCommitService.invoke(provider, repoID, sha, buildTarget)
   * - 源码：CodeService.getFileContent(repoID, sha, filepath, provider)，按 coverage 中的文件路径逐文件拉取
   */
  async generateHtmlReport(
    provider: string,
    repoID: string,
    sha: string,
    buildTarget: string = '',
  ): Promise<{ buffer: Buffer; size: number }> {
    const coverageResult = await this.coverageMapForCommitService.invoke({
      provider: provider as 'github' | 'gitlab',
      repoID,
      sha,
      buildTarget,
      filePath: '',
      scene: undefined,
    });

    if (
      !coverageResult ||
      typeof coverageResult !== 'object' ||
      'success' in coverageResult
    ) {
      throw new BadRequestException(
        (coverageResult as { message?: string })?.message ??
          'No coverage data found for the specified commit',
      );
    }

    const coverageMap = coverageResult as Record<string, Record<string, unknown>>;
    const filePaths = Object.keys(coverageMap);
    if (filePaths.length === 0) {
      throw new BadRequestException(
        'No coverage data found for the specified commit',
      );
    }

    const sourceFiles = new Map<string, string>();
    for (const filePath of filePaths) {
      try {
        const { content } = await this.codeService.getFileContent({
          repoID,
          sha,
          filepath: filePath,
          provider,
        });
        const decoded = decodeFileContent(content ?? null);
        if (decoded) sourceFiles.set(filePath, decoded);
      } catch (err) {
        this.logger.warn(`Failed to get source for ${filePath}: ${err}`);
      }
    }

    const tempDir = tmp.dirSync({ unsafeCleanup: true });
    const reportDir = path.join(tempDir.name, 'coverage-report');
    const sourceDir = path.join(tempDir.name, 'source');
    fs.mkdirSync(reportDir, { recursive: true });
    fs.mkdirSync(sourceDir, { recursive: true });

    try {
      for (const [filePath, content] of sourceFiles) {
        const fullPath = path.join(sourceDir, filePath);
        const dir = path.dirname(fullPath);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf8');
      }

      const istanbulCoverageMap = createCoverageMap();

      for (const [filePath, coverage] of Object.entries(coverageMap)) {
        if (!sourceFiles.has(filePath)) continue;
        const absolutePath = path.join(sourceDir, filePath);
        istanbulCoverageMap.addFileCoverage({
          ...coverage,
          path: absolutePath,
        } as any);
      }

      const context = createContext({
        dir: reportDir,
        coverageMap: istanbulCoverageMap,
        sourceFinder(filepath: string): string {
          try {
            return fs.readFileSync(filepath, 'utf8');
          } catch (e) {
            throw new Error(`Unable to lookup source: ${filepath}`);
          }
        },
      });

      const htmlReport = create('html');
      htmlReport.execute(context);

      const zipPath = await this.createZip(reportDir);
      const buffer = fs.readFileSync(zipPath);
      const size = buffer.length;
      try {
        fs.unlinkSync(zipPath);
      } catch {
        // ignore
      }
      return { buffer, size };
    } finally {
      tempDir.removeCallback();
    }
  }

  private createZip(reportDir: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const zipPath = tmp.tmpNameSync({ postfix: '.zip' });
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve(zipPath));
      archive.on('error', (err) => reject(err));
      archive.pipe(output);
      archive.directory(reportDir, false);
      archive.finalize();
    });
  }

  async create(dto: CreateSnapshotDto, createdBy: string = 'system') {
    const subjectID = (dto.sha ?? dto.subjectID ?? '').trim();
    if (!subjectID)
      throw new BadRequestException('sha or subjectID is required');
    const now = new Date();

    let artifactZip = FAKE_ARTIFACT;
    let artifactSize = FAKE_ARTIFACT_SIZE;

    try {
      const { buffer, size } = await this.generateHtmlReport(
        dto.provider,
        dto.repoID,
        subjectID,
        '',
      );
      artifactZip = buffer;
      artifactSize = size;
      this.logger.log(
        `Snapshot report generated for ${dto.repoID}@${subjectID.substring(0, 7)} (${size} bytes)`,
      );
    } catch (err) {
      this.logger.warn(
        `Snapshot report generation failed, using placeholder: ${err}`,
      );
    }

    return this.prisma.coverageSnapshot.create({
      data: {
        provider: dto.provider,
        repoID: dto.repoID,
        subject: 'commit',
        subjectID,
        title: dto.title ?? null,
        description: dto.description ?? null,
        freezeTime: now,
        status: 'done',
        artifactZip,
        artifactSize,
        createdBy,
        finishedAt: now,
        buildHash: '',
        scene: {},
      },
    });
  }

  async findMany(repoID: string, provider: string) {
    const list = await this.prisma.coverageSnapshot.findMany({
      where: { repoID, provider },
      select: {
        id: true,
        provider: true,
        repoID: true,
        subject: true,
        subjectID: true,
        title: true,
        description: true,
        freezeTime: true,
        status: true,
        artifactSize: true,
        createdBy: true,
        createdAt: true,
        finishedAt: true,
        buildHash: true,
        scene: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((row) => ({
      ...row,
      id: String(row.id),
      sha: row.subjectID,
      createdAt: row.createdAt.toISOString(),
      freezeTime: row.freezeTime.toISOString(),
      finishedAt: row.finishedAt.toISOString(),
    }));
  }

  async findOne(id: number) {
    const row = await this.prisma.coverageSnapshot.findFirst({
      where: { id },
      select: {
        id: true,
        provider: true,
        repoID: true,
        subject: true,
        subjectID: true,
        title: true,
        description: true,
        freezeTime: true,
        status: true,
        artifactSize: true,
        createdBy: true,
        createdAt: true,
        finishedAt: true,
        buildHash: true,
        scene: true,
      },
    });
    if (!row) throw new NotFoundException(`Snapshot ${id} not found`);
    return {
      ...row,
      id: String(row.id),
      sha: row.subjectID,
      createdAt: row.createdAt.toISOString(),
      freezeTime: row.freezeTime.toISOString(),
      finishedAt: row.finishedAt.toISOString(),
    };
  }

  async update(id: number, dto: UpdateSnapshotDto) {
    await this.findOne(id);
    const updated = await this.prisma.coverageSnapshot.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      select: {
        id: true,
        provider: true,
        repoID: true,
        subject: true,
        subjectID: true,
        title: true,
        description: true,
        freezeTime: true,
        status: true,
        artifactSize: true,
        createdBy: true,
        createdAt: true,
        finishedAt: true,
        buildHash: true,
        scene: true,
      },
    });
    return {
      ...updated,
      id: String(updated.id),
      sha: updated.subjectID,
      createdAt: updated.createdAt.toISOString(),
      freezeTime: updated.freezeTime.toISOString(),
      finishedAt: updated.finishedAt.toISOString(),
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.coverageSnapshot.delete({ where: { id } });
  }

  async getArtifactBuffer(id: number): Promise<{ buffer: Buffer; size: number }> {
    const row = await this.prisma.coverageSnapshot.findUnique({
      where: { id },
      select: { artifactZip: true, artifactSize: true },
    });
    if (!row) throw new NotFoundException(`Snapshot ${id} not found`);
    const buffer = Buffer.from(row.artifactZip);
    return { buffer, size: row.artifactSize };
  }
}
