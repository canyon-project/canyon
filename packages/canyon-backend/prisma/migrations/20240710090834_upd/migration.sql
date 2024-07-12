/*
  Warnings:

  - Changed the type of `dim_type` on the `reckoning` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DimType" AS ENUM ('b', 'f', 's');

-- AlterTable
ALTER TABLE "reckoning" DROP COLUMN "dim_type",
ADD COLUMN     "dim_type" "DimType" NOT NULL;
