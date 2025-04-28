/*
  Warnings:

  - Added the required column `input_source_map` to the `canyonjs_coverage_map_relation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "canyonjs_coverage_map_relation" ADD COLUMN     "input_source_map" TEXT NOT NULL;

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
