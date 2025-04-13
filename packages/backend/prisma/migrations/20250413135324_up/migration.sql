/*
  Warnings:

  - Added the required column `coverage_id` to the `canyonjs_coverage_map_relation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "canyonjs_coverage_map_relation" ADD COLUMN     "coverage_id" TEXT NOT NULL;
