/*
  Warnings:

  - You are about to drop the `reactor_codechange` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reactor_cov_hit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reactor_cov_map_test` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reactor_coverage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reactor_distributedlock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reactor_filepath` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reactor_git` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reactor_git_provider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reactor_project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reactor_user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "reactor_codechange";

-- DropTable
DROP TABLE "reactor_cov_hit";

-- DropTable
DROP TABLE "reactor_cov_map_test";

-- DropTable
DROP TABLE "reactor_coverage";

-- DropTable
DROP TABLE "reactor_distributedlock";

-- DropTable
DROP TABLE "reactor_filepath";

-- DropTable
DROP TABLE "reactor_git";

-- DropTable
DROP TABLE "reactor_git_provider";

-- DropTable
DROP TABLE "reactor_project";

-- DropTable
DROP TABLE "reactor_user";

-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "favor" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Git" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "providerRefreshToken" TEXT NOT NULL,
    "providerAccessToken" TEXT NOT NULL,
    "providerScope" TEXT NOT NULL,
    "loggedIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Git_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitProvider" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clientID" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL,

    CONSTRAINT "GitProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "new_coverage" (
    "id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "build_provider" TEXT NOT NULL,
    "build_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "cov_type" TEXT NOT NULL,
    "branches_total" INTEGER NOT NULL,
    "branches_covered" INTEGER NOT NULL,
    "functions_total" INTEGER NOT NULL,
    "functions_covered" INTEGER NOT NULL,
    "lines_total" INTEGER NOT NULL,
    "lines_covered" INTEGER NOT NULL,
    "statements_total" INTEGER NOT NULL,
    "statements_covered" INTEGER NOT NULL,
    "newlines_total" INTEGER NOT NULL,
    "newlines_covered" INTEGER NOT NULL,
    "hit" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "new_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "new_coverage_map" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "map" TEXT NOT NULL,

    CONSTRAINT "new_coverage_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path_with_namespace" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bu" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "members" JSONB NOT NULL,
    "coverage" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "default_branch" TEXT NOT NULL,
    "instrument_cwd" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codechange" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "additions" INTEGER[],
    "deletions" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codechange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributedlock" (
    "lockName" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockTimestamp" TIMESTAMP(3),
    "lockExpiration" TIMESTAMP(3),

    CONSTRAINT "distributedlock_pkey" PRIMARY KEY ("lockName")
);

-- CreateIndex
CREATE UNIQUE INDEX "new_coverage_map_project_id_sha_key" ON "new_coverage_map"("project_id", "sha");
