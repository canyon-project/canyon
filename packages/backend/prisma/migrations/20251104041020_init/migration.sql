-- CreateTable
CREATE TABLE "canyon_repo" (
    "id" TEXT NOT NULL,
    "path_with_namespace" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bu" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyon_repo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyon_coverage" (
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

    CONSTRAINT "canyon_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyon_coverage_source_map" (
    "hash" TEXT NOT NULL,
    "source_map" TEXT NOT NULL,

    CONSTRAINT "canyon_coverage_source_map_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "canyon_coverage_map_relation" (
    "id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "coverage_map_hash_id" TEXT NOT NULL,
    "full_file_path" TEXT NOT NULL,
    "restore_full_file_path" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "source_map_hash_id" TEXT NOT NULL,
    "content_hash_id" TEXT NOT NULL,

    CONSTRAINT "canyon_coverage_map_relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyon_map" (
    "hash" TEXT NOT NULL,
    "origin" JSONB NOT NULL,
    "restore" JSONB NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyon_map_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "canyon_hit" (
    "id" TEXT NOT NULL,
    "coverage_id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "s" JSONB NOT NULL,
    "f" JSONB NOT NULL,
    "b" JSONB NOT NULL,
    "aggregated" BOOLEAN NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyon_hit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyon_hit_agg" (
    "coverage_id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "s" JSONB NOT NULL,
    "f" JSONB NOT NULL,
    "b" JSONB NOT NULL,
    "latest_ts" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyon_hit_agg_pkey" PRIMARY KEY ("coverage_id","version_id","file_path")
);

-- CreateTable
CREATE TABLE "canyon_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyon_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "canyon_coverage_provider_idx" ON "canyon_coverage"("provider");

-- CreateIndex
CREATE INDEX "repo_id_idx" ON "canyon_coverage"("repo_id");

-- CreateIndex
CREATE INDEX "canyon_coverage_sha_idx" ON "canyon_coverage"("sha");

-- CreateIndex
CREATE INDEX "canyon_coverage_map_relation_version_id_idx" ON "canyon_coverage_map_relation"("version_id");

-- CreateIndex
CREATE INDEX "canyon_coverage_map_relation_coverage_map_hash_id_idx" ON "canyon_coverage_map_relation"("coverage_map_hash_id");

-- CreateIndex
CREATE INDEX "canyon_hit_coverage_id_idx" ON "canyon_hit"("coverage_id");

-- CreateIndex
CREATE INDEX "canyon_hit_version_id_idx" ON "canyon_hit"("version_id");
