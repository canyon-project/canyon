/*
  Warnings:

  - You are about to drop the column `mapJson` on the `file_map` table. All the data in the column will be lost.
  - You are about to drop the column `projectID` on the `file_map` table. All the data in the column will be lost.
  - You are about to drop the column `branchIndex` on the `reckoning` table. All the data in the column will be lost.
  - You are about to drop the column `dimType` on the `reckoning` table. All the data in the column will be lost.
  - You are about to drop the column `mapIndex` on the `reckoning` table. All the data in the column will be lost.
  - You are about to drop the column `projectID` on the `reckoning` table. All the data in the column will be lost.
  - Added the required column `map_json` to the `file_map` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `file_map` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branch_index` to the `reckoning` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dim_type` to the `reckoning` table without a default value. This is not possible if the table is not empty.
  - Added the required column `map_index` to the `reckoning` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `reckoning` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file_map" DROP COLUMN "mapJson",
DROP COLUMN "projectID",
ADD COLUMN     "map_json" TEXT NOT NULL,
ADD COLUMN     "project_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "reckoning" DROP COLUMN "branchIndex",
DROP COLUMN "dimType",
DROP COLUMN "mapIndex",
DROP COLUMN "projectID",
ADD COLUMN     "branch_index" TEXT NOT NULL,
ADD COLUMN     "dim_type" TEXT NOT NULL,
ADD COLUMN     "map_index" TEXT NOT NULL,
ADD COLUMN     "project_id" TEXT NOT NULL;
