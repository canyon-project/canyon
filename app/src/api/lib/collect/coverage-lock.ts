import { prisma } from "@/api/lib/prisma.ts";
import { logger } from "@/api/logger/index.ts";

const LOCK_TIMEOUT_MS = Number(process.env.COVERAGE_LOCK_TIMEOUT_MS || 300000);

export async function acquireLock(coverageID: string): Promise<boolean> {
  try {
    await cleanExpiredLocks();

    const lockedBy = process.env.HOSTNAME || `pid-${process.pid}`;

    await prisma.coverageLock.create({
      data: {
        coverageID,
        lockedAt: new Date(),
        lockedBy,
      },
    });

    logger({
      type: "debug",
      title: "CoverageLock",
      message: "Lock acquired",
      addInfo: { coverageID, lockedBy },
    });
    return true;
  } catch {
    logger({
      type: "debug",
      title: "CoverageLock",
      message: "Lock already exists",
      addInfo: { coverageID },
    });
    return false;
  }
}

export async function releaseLock(coverageID: string): Promise<void> {
  try {
    await prisma.coverageLock.delete({
      where: { coverageID },
    });
    logger({
      type: "debug",
      title: "CoverageLock",
      message: "Lock released",
      addInfo: { coverageID },
    });
  } catch (e) {
    logger({
      type: "warn",
      title: "CoverageLock",
      message: "Failed to release lock",
      addInfo: {
        coverageID,
        error: e instanceof Error ? e.message : String(e),
      },
    });
  }
}

async function cleanExpiredLocks(): Promise<void> {
  try {
    const expiredAt = new Date(Date.now() - LOCK_TIMEOUT_MS);
    await prisma.coverageLock.deleteMany({
      where: { lockedAt: { lt: expiredAt } },
    });
  } catch (e) {
    logger({
      type: "warn",
      title: "CoverageLock",
      message: "Failed to clean expired locks",
      addInfo: { error: e instanceof Error ? e.message : String(e) },
    });
  }
}
