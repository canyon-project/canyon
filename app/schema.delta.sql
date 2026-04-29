-- CreateEnum
CREATE TYPE "RepoMemberRole" AS ENUM ('admin', 'developer');

-- AlterTable
ALTER TABLE "canyon_next_repo" ALTER COLUMN "creator" SET NOT NULL,
ALTER COLUMN "creator" SET DEFAULT '';

-- CreateTable
CREATE TABLE "canyon_next_repo_member" (
    "id" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "RepoMemberRole" NOT NULL DEFAULT 'developer',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyon_next_repo_member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "canyon_next_repo_member_repo_id_idx" ON "canyon_next_repo_member"("repo_id");

-- CreateIndex
CREATE UNIQUE INDEX "canyon_next_repo_member_repo_id_user_id_key" ON "canyon_next_repo_member"("repo_id", "user_id");

-- AddForeignKey
ALTER TABLE "canyon_next_repo_member" ADD CONSTRAINT "canyon_next_repo_member_repo_id_fkey" FOREIGN KEY ("repo_id") REFERENCES "canyon_next_repo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

