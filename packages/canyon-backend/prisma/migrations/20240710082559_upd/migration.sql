/*
  Warnings:

  - Changed the type of `branch_index` on the `reckoning` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `map_index` on the `reckoning` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "reckoning" DROP COLUMN "branch_index",
ADD COLUMN     "branch_index" INTEGER NOT NULL,
DROP COLUMN "map_index",
ADD COLUMN     "map_index" INTEGER NOT NULL;
