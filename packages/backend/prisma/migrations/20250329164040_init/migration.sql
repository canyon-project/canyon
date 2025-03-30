-- CreateEnum
CREATE TYPE "CovType" AS ENUM ('BUILD_ID', 'REPORT_PROVIDER_AUTO', 'REPORT_PROVIDER_MANUAL', 'REPORT_ID');

-- CreateEnum
CREATE TYPE "AggregatedState" AS ENUM ('UNPROCESSED', 'PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "canyonjs_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "favor" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyonjs_coverage" (
    "id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "build_provider" TEXT NOT NULL,
    "build_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "report_provider" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "cov_type" "CovType" NOT NULL,
    "scope_id" TEXT NOT NULL,
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

    CONSTRAINT "canyonjs_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyonjs_coverage_map" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "build_provider" TEXT NOT NULL,
    "build_id" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "old_path" TEXT NOT NULL,
    "input_source_map" TEXT NOT NULL,
    "branch_map" TEXT NOT NULL,
    "statement_map" TEXT NOT NULL,
    "fn_map" TEXT NOT NULL,
    "instrument_cwd" TEXT NOT NULL,
    "time" INTEGER NOT NULL,

    CONSTRAINT "canyonjs_coverage_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyonjs_project" (
    "id" TEXT NOT NULL,
    "path_with_namespace" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bu" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "members" JSONB NOT NULL,
    "scopes" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs_project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyonjs_diff" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "additions" INTEGER[],
    "deletions" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs_diff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyonjs_distributed_lock" (
    "lock_name" TEXT NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "lock_timestamp" TIMESTAMP(3) NOT NULL,
    "lock_expiration" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyonjs_distributed_lock_pkey" PRIMARY KEY ("lock_name")
);

-- CreateTable
CREATE TABLE "canyonjs_coverage_log" (
    "id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "build_provider" TEXT NOT NULL,
    "build_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "report_provider" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "is_hit_and_map_separated" BOOLEAN NOT NULL,
    "aggregated_state" "AggregatedState" NOT NULL,
    "size" INTEGER NOT NULL,
    "instrument_cwd" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs_coverage_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyonjs_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "canyonjs_coverage_map_path_idx" ON "canyonjs_coverage_map"("path");

-- CreateIndex
CREATE INDEX "canyonjs_coverage_map_repo_id_sha_idx" ON "canyonjs_coverage_map"("repo_id", "sha");
