-- CreateTable
CREATE TABLE "canyon_final_infra_config" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdOn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMPTZ(3) NOT NULL,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedEnvFileValue" TEXT NOT NULL,

    CONSTRAINT "canyon_final_infra_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyon_final_repo" (
    "id" TEXT NOT NULL,
    "path_with_namespace" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "bu" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tags" JSONB NOT NULL,
    "members" JSONB NOT NULL,

    CONSTRAINT "canyon_final_repo_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "canyon_final_log" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyon_final_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyon_final_coverage" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "branches" TEXT,
    "builds" JSONB,
    "instrument_cwd" TEXT NOT NULL,
    "report_provider" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "build_target" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyon_final_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyon_final_coverage_source_map" (
    "hash" TEXT NOT NULL,
    "source_map" BYTEA NOT NULL,

    CONSTRAINT "canyon_final_coverage_source_map_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "canyon_final_coverage_map_relation" (
    "id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "coverage_map_hash_id" TEXT NOT NULL,
    "full_file_path" TEXT NOT NULL,
    "restore_full_file_path" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "source_map_hash_id" TEXT NOT NULL,
    "content_hash_id" TEXT NOT NULL,

    CONSTRAINT "canyon_final_coverage_map_relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyon_final_map" (
    "hash" TEXT NOT NULL,
    "origin" JSONB NOT NULL,
    "restore" JSONB NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyon_final_map_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "canyon_final_hit" (
    "id" TEXT NOT NULL,
    "coverage_id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "s" JSONB NOT NULL,
    "f" JSONB NOT NULL,
    "b" JSONB NOT NULL,
    "input_source_map" INTEGER,
    "aggregated" BOOLEAN NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyon_final_hit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyon_final_hit_agg" (
    "coverage_id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "s" JSONB NOT NULL,
    "f" JSONB NOT NULL,
    "b" JSONB NOT NULL,
    "latest_ts" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyon_final_hit_agg_pkey" PRIMARY KEY ("coverage_id","version_id","file_path")
);

-- CreateTable
CREATE TABLE "canyon_final_diff" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "additions" INTEGER[],
    "deletions" INTEGER[],
    "subject" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,

    CONSTRAINT "canyon_final_diff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "canyon_final_infra_config_name_key" ON "canyon_final_infra_config"("name");

-- CreateIndex
CREATE INDEX "canyon_final_coverage_provider_idx" ON "canyon_final_coverage"("provider");

-- CreateIndex
CREATE INDEX "repo_id_idx" ON "canyon_final_coverage"("repo_id");

-- CreateIndex
CREATE INDEX "canyon_final_coverage_sha_idx" ON "canyon_final_coverage"("sha");

-- CreateIndex
CREATE INDEX "canyon_final_coverage_map_relation_version_id_idx" ON "canyon_final_coverage_map_relation"("version_id");

-- CreateIndex
CREATE INDEX "canyon_final_coverage_map_relation_coverage_map_hash_id_idx" ON "canyon_final_coverage_map_relation"("coverage_map_hash_id");

-- CreateIndex
CREATE INDEX "canyon_final_hit_coverage_id_idx" ON "canyon_final_hit"("coverage_id");

-- CreateIndex
CREATE INDEX "canyon_final_hit_version_id_idx" ON "canyon_final_hit"("version_id");
