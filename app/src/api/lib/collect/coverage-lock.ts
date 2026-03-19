import { prisma } from "@/api/lib/prisma.ts";

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
    return true;
  } catch {
    return false;
  }
}

export async function releaseLock(coverageID: string): Promise<void> {
  try {
    await prisma.coverageLock.delete({
      where: { coverageID },
    });
  } catch (e) {}
}

async function cleanExpiredLocks(): Promise<void> {
  try {
    const expiredAt = new Date(Date.now() - LOCK_TIMEOUT_MS);
    await prisma.coverageLock.deleteMany({
      where: { lockedAt: { lt: expiredAt } },
    });
  } catch (e) {}
}
