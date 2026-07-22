-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "canyonjs_next5_book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,

    CONSTRAINT "canyonjs_next5_book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyonjs_next5_coverage_client_payload_idempotency" (
    "payload_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs_next5_coverage_client_payload_idempotency_pkey" PRIMARY KEY ("payload_hash")
);

-- CreateTable
CREATE TABLE "canyonjs_next5_coverage" (
    "build_hash" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "build_target" TEXT NOT NULL,
    "instrument_cwd" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyonjs_next5_coverage_pkey" PRIMARY KEY ("build_hash")
);

-- CreateTable
CREATE TABLE "canyonjs_next5_coverage_scene" (
    "id" TEXT NOT NULL,
    "build_hash" TEXT NOT NULL,
    "scene_key" TEXT NOT NULL,
    "scene" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyonjs_next5_coverage_scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyonjs_next5_coverage_hit" (
    "id" TEXT NOT NULL,
    "build_hash" TEXT NOT NULL,
    "scene_key" TEXT NOT NULL,
    "raw_file_path" TEXT NOT NULL,
    "s" JSONB NOT NULL,
    "f" JSONB NOT NULL,
    "b" JSONB NOT NULL,
    "input_source_map" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyonjs_next5_coverage_hit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyonjs_next5_coverage_map_relation" (
    "id" TEXT NOT NULL,
    "full_file_path" TEXT NOT NULL,
    "restore_full_file_path" TEXT NOT NULL,
    "build_hash" TEXT NOT NULL,
    "coverage_map_hash" TEXT NOT NULL,
    "file_content_hash" TEXT NOT NULL,
    "coverage_map_key" TEXT NOT NULL,
    "source_map_hash" TEXT,

    CONSTRAINT "canyonjs_next5_coverage_map_relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canyonjs_next5_coverage_map" (
    "hash" TEXT NOT NULL,
    "map" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyonjs_next5_coverage_map_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "canyonjs_next5_coverage_source_map" (
    "hash" TEXT NOT NULL,
    "source_map" BYTEA NOT NULL,

    CONSTRAINT "canyonjs_next5_coverage_source_map_pkey" PRIMARY KEY ("hash")
);

-- CreateIndex
CREATE INDEX "canyonjs_next5_coverage_provider_repo_id_sha_build_target_idx" ON "canyonjs_next5_coverage"("provider", "repo_id", "sha", "build_target");

-- CreateIndex
CREATE INDEX "canyonjs_next5_coverage_repo_id_idx" ON "canyonjs_next5_coverage"("repo_id");

-- CreateIndex
CREATE INDEX "canyonjs_next5_coverage_scene_build_hash_idx" ON "canyonjs_next5_coverage_scene"("build_hash");

-- CreateIndex
CREATE UNIQUE INDEX "canyonjs_next5_coverage_scene_build_hash_scene_key_key" ON "canyonjs_next5_coverage_scene"("build_hash", "scene_key");

-- CreateIndex
CREATE INDEX "canyonjs_next5_coverage_hit_build_hash_scene_key_idx" ON "canyonjs_next5_coverage_hit"("build_hash", "scene_key");

-- CreateIndex
CREATE UNIQUE INDEX "canyonjs_next5_coverage_hit_build_hash_scene_key_raw_file_p_key" ON "canyonjs_next5_coverage_hit"("build_hash", "scene_key", "raw_file_path");

-- CreateIndex
CREATE INDEX "canyonjs_next5_coverage_map_relation_build_hash_idx" ON "canyonjs_next5_coverage_map_relation"("build_hash");

-- CreateIndex
CREATE INDEX "canyonjs_next5_coverage_map_relation_coverage_map_key_idx" ON "canyonjs_next5_coverage_map_relation"("coverage_map_key");

-- CreateIndex
CREATE INDEX "canyonjs_next5_coverage_map_relation_source_map_hash_idx" ON "canyonjs_next5_coverage_map_relation"("source_map_hash");

-- CreateIndex
CREATE UNIQUE INDEX "canyonjs_next5_coverage_map_relation_build_hash_full_file_p_key" ON "canyonjs_next5_coverage_map_relation"("build_hash", "full_file_path");

-- AddForeignKey
ALTER TABLE "canyonjs_next5_coverage_scene" ADD CONSTRAINT "canyonjs_next5_coverage_scene_build_hash_fkey" FOREIGN KEY ("build_hash") REFERENCES "canyonjs_next5_coverage"("build_hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canyonjs_next5_coverage_hit" ADD CONSTRAINT "canyonjs_next5_coverage_hit_build_hash_scene_key_fkey" FOREIGN KEY ("build_hash", "scene_key") REFERENCES "canyonjs_next5_coverage_scene"("build_hash", "scene_key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canyonjs_next5_coverage_map_relation" ADD CONSTRAINT "canyonjs_next5_coverage_map_relation_build_hash_fkey" FOREIGN KEY ("build_hash") REFERENCES "canyonjs_next5_coverage"("build_hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canyonjs_next5_coverage_map_relation" ADD CONSTRAINT "canyonjs_next5_coverage_map_relation_coverage_map_key_fkey" FOREIGN KEY ("coverage_map_key") REFERENCES "canyonjs_next5_coverage_map"("hash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canyonjs_next5_coverage_map_relation" ADD CONSTRAINT "canyonjs_next5_coverage_map_relation_source_map_hash_fkey" FOREIGN KEY ("source_map_hash") REFERENCES "canyonjs_next5_coverage_source_map"("hash") ON DELETE SET NULL ON UPDATE CASCADE;
