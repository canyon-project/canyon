/*
  Warnings:

  - You are about to drop the column `input_source_map` on the `canyonjs_coverage_map_relation` table. All the data in the column will be lost.
  - Added the required column `source_map_hash_id` to the `canyonjs_coverage_map_relation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "canyonjs_coverage_map_relation" DROP COLUMN "input_source_map",
ADD COLUMN     "source_map_hash_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "canyonjs_coverage_source_map" (
    "hash" TEXT NOT NULL,
    "source_map" BYTEA NOT NULL,

    CONSTRAINT "canyonjs_coverage_source_map_pkey" PRIMARY KEY ("hash")
);
