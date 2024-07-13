/*
  Warnings:

  - Added the required column `instrument_cwd` to the `project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DimType" AS ENUM ('b', 'f', 's');

-- CreateTable
CREATE TABLE "reckoning" (
    "id" TEXT NOT NULL,
    "dim_type" "DimType" NOT NULL,
    "map_index" INTEGER NOT NULL,
    "branch_index" INTEGER NOT NULL,
    "hits" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reckoning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_map" (
    "id" TEXT NOT NULL,
    "map_json" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,

    CONSTRAINT "file_map_pkey" PRIMARY KEY ("id")
);
