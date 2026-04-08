-- canyon_next_diff：新增 created_at（与 Prisma Diff.createdAt 一致）
-- PostgreSQL

ALTER TABLE canyon_next_diff
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
