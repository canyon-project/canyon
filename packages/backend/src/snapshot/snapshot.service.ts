import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateSnapshotDto } from './dto/create-snapshot.dto';
import type { UpdateSnapshotDto } from './dto/update-snapshot.dto';

/** 生成假产物：占位 zip 内容（PK 头 + 空内容） */
function createFakeArtifact(): Buffer {
  // 最小 zip：本地文件头 + 结束标记，无实际文件
  const centralHeader = Buffer.alloc(0);
  const endRecord = Buffer.from([
    0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
  return Buffer.concat([centralHeader, endRecord]);
}

const FAKE_ARTIFACT = createFakeArtifact();
const FAKE_ARTIFACT_SIZE = FAKE_ARTIFACT.length;

@Injectable()
export class SnapshotService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSnapshotDto, createdBy: string = 'system') {
    const subjectID = (dto.sha ?? dto.subjectID ?? '').trim();
    if (!subjectID) throw new BadRequestException('sha or subjectID is required');
    const now = new Date();
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
        artifactZip: FAKE_ARTIFACT,
        artifactSize: FAKE_ARTIFACT_SIZE,
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

  /** 仅返回产物二进制，用于下载 */
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
