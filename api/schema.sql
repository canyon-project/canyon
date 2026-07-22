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
CREATE TABLE "canyon_next_coverage_hit" (
    "id" TEXT NOT NULL,
    "build_hash" TEXT NOT NULL,
    "scene_key" TEXT NOT NULL,
    "raw_file_path" TEXT NOT NULL,
    "s" JSONB NOT NULL,
    "f" JSONB NOT NULL,
    "b" JSONB NOT NULL,
    "input_source_map" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canyon_next_coverage_hit_pkey" PRIMARY KEY ("id")
);
