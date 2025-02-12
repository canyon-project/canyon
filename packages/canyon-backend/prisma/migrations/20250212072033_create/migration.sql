-- CreateTable
CREATE TABLE "sys_setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "sys_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "favor" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "git_provider" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL,
    "private_token" TEXT NOT NULL,

    CONSTRAINT "git_provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coverage" (
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
    "summary" BYTEA NOT NULL,
    "hit" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coverage_map" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "map" BYTEA NOT NULL,
    "instrument_cwd" TEXT NOT NULL,

    CONSTRAINT "coverage_map_pkey" PRIMARY KEY ("id")
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
    "auto_instrument" JSONB,
    "coverage" TEXT NOT NULL,
    "default_branch" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codechange" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "additions" INTEGER[],
    "deletions" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codechange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributed_lock" (
    "lock_name" TEXT NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "lock_timestamp" TIMESTAMP(3),
    "lock_expiration" TIMESTAMP(3),

    CONSTRAINT "distributed_lock_pkey" PRIMARY KEY ("lock_name")
);

-- CreateTable
CREATE TABLE "ut_coverage" (
    "id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
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
    "summary" BYTEA NOT NULL,
    "hit" BYTEA NOT NULL,
    "source_type" TEXT NOT NULL,
    "instrument_cwd" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ut_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coverage_map_path_idx" ON "coverage_map"("path");

-- CreateIndex
CREATE INDEX "coverage_map_repo_id_sha_idx" ON "coverage_map"("repo_id", "sha");
