/*
  Warnings:

  - You are about to drop the `coveragedata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file_map` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reckoning` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `instrument_cwd` to the `project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project" ADD COLUMN     "instrument_cwd" TEXT NOT NULL;

-- DropTable
DROP TABLE "coveragedata";

-- DropTable
DROP TABLE "file_map";

-- DropTable
DROP TABLE "reckoning";

-- DropEnum
DROP TYPE "DimType";

-- CreateTable
CREATE TABLE "CovMap" (
    "id" TEXT NOT NULL,
    "map_json_str_zstd" TEXT NOT NULL,

    CONSTRAINT "CovMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CovHit" (
    "id" TEXT NOT NULL,
    "map_json_str" TEXT NOT NULL,

    CONSTRAINT "CovHit_pkey" PRIMARY KEY ("id")
);
