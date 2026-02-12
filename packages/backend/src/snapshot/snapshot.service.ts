import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import archiver from 'archiver';
import * as fs from 'node:fs';
import * as tmp from 'tmp';
import { createCoverageMap } from 'istanbul-lib-coverage';
import libReport from 'istanbul-lib-report';
import reports from 'istanbul-reports';
import { CodeService } from '../code/service/code.service';
import { CoverageMapForCommitService } from '../coverage/services/coverage-map-for-commit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { UpdateSnapshotDto } from './dto/update-snapshot.dto';

@Injectable()
export class SnapshotService {
  private readonly logger = new Logger(SnapshotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
    private readonly codeService: CodeService,
  ) {}

  async create(dto: CreateSnapshotDto) {
    const subjectID = dto.sha ?? dto.subjectID;
    if (!subjectID) {
      throw new BadRequestException('sha 或 subjectID 至少填一个');
    }
    const subject = dto.sha ? 'commit' : 'accumulative';
    const provider = dto.provider ?? 'gitlab';
    const repoID = dto.repoID;

    const coverageRecord = await this.prisma.coverage.findFirst({
      where: {
        provider,
        repoID,
        sha: subjectID.length === 40 ? subjectID : undefined,
      },
      select: { buildTarget: true, buildHash: true },
    });
    const buildTarget = coverageRecord?.buildTarget ?? '';
    const buildHash = coverageRecord?.buildHash ?? '';

    let artifactBuffer: Buffer;
    let artifactSize: number;
    try {
      const result = await this.generateHtmlReport(
        provider,
        repoID,
        subjectID,
        buildTarget,
      );
      artifactBuffer = result.buffer;
      artifactSize = result.size;
    } catch (err) {
      this.logger.warn(`generateHtmlReport failed: ${err}`);
      artifactBuffer = Buffer.from([]);
      artifactSize = 0;
    }

    const snapshot = await this.prisma.coverageSnapshot.create({
      data: {
        provider,
        repoID,
        subject,
        subjectID,
        title: dto.title ?? null,
        description: dto.description ?? null,
        freezeTime: new Date(),
        status: 'done',
        artifactZip: artifactBuffer,
        artifactSize,
        createdBy: 'system',
        finishedAt: new Date(),
        buildHash,
        scene: {},
      },
    });
    return snapshot;
  }

  async findMany(repoID: string, provider: string) {
    return this.prisma.coverageSnapshot.findMany({
      where: { repoID, provider },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const row = await this.prisma.coverageSnapshot.findUnique({
      where: { id },
    });
    if (!row) throw new NotFoundException('快照不存在');
    const { artifactZip: _, ...rest } = row;
    return rest;
  }

  async getArtifactBuffer(id: number): Promise<{ buffer: Buffer; size: number }> {
    const row = await this.prisma.coverageSnapshot.findUnique({
      where: { id },
      select: { artifactZip: true, artifactSize: true },
    });
    if (!row) throw new NotFoundException('快照不存在');
    return {
      buffer: Buffer.from(row.artifactZip),
      size: row.artifactSize,
    };
  }

  async update(id: number, dto: UpdateSnapshotDto) {
    await this.prisma.coverageSnapshot.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.coverageSnapshot.delete({ where: { id } });
  }

  /**
   * 根据覆盖率 + 源码生成 HTML 报告并打成 zip
   */
  private async generateHtmlReport(
    provider: string,
    repoID: string,
    sha: string,
    buildTarget: string,
  ): Promise<{ buffer: Buffer; size: number }> {
    const coverageResult = await this.coverageMapForCommitService.invoke({
      provider: provider as 'gitlab' | 'github',
      repoID,
      sha,
      buildTarget: buildTarget || undefined,
    });

    if (
      typeof coverageResult === 'object' &&
      coverageResult !== null &&
      'success' in coverageResult &&
      (coverageResult as { success?: boolean }).success === false
    ) {
      throw new BadRequestException(
        (coverageResult as { message?: string }).message ??
          'No coverage data for commit',
      );
    }

    const coverageMap = coverageResult as Record<string, Record<string, unknown>>;
    const filePaths = Object.keys(coverageMap);
    if (filePaths.length === 0) {
      throw new BadRequestException(
        'No coverage data found for the specified commit',
      );
    }

    const sourceFiles = await this.codeService.getSourceFiles(
      provider,
      repoID,
      sha,
      filePaths,
    );

    const dir = tmp.dirSync({ unsafeCleanup: true }).name;
    try {
      const coverageMapInstance = createCoverageMap(
        coverageMap as unknown as Parameters<typeof createCoverageMap>[0],
      );
      const context = libReport.createContext({
        dir,
        coverageMap: coverageMapInstance,
        sourceFinder: (filePath: string) =>
          sourceFiles.get(filePath) ?? fs.readFileSync(filePath, 'utf8'),
      });
      const report = reports.create('html', {});
      report.execute(context);

      const chunks: Buffer[] = [];
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      await new Promise<void>((resolve, reject) => {
        archive.on('end', resolve);
        archive.on('error', reject);
        archive.directory(dir, false);
        archive.finalize();
      });
      const buffer = Buffer.concat(chunks);
      return { buffer, size: buffer.length };
    } finally {
      try {
        fs.rmSync(dir, { recursive: true });
      } catch {
        // ignore
      }
    }
  }
}
