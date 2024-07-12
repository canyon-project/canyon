/*
  Warnings:

  - Added the required column `branch` to the `file_map` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_id` to the `reckoning` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rule` to the `reckoning` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file_map" ADD COLUMN     "branch" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "reckoning" ADD COLUMN     "report_id" TEXT NOT NULL,
ADD COLUMN     "rule" TEXT NOT NULL;
