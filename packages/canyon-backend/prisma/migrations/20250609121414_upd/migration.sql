/*
  Warnings:

  - Added the required column `changebranches_covered` to the `coverage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `changebranches_total` to the `coverage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `changefunctions_covered` to the `coverage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `changefunctions_total` to the `coverage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "coverage" ADD COLUMN     "changebranches_covered" INTEGER NOT NULL,
ADD COLUMN     "changebranches_total" INTEGER NOT NULL,
ADD COLUMN     "changefunctions_covered" INTEGER NOT NULL,
ADD COLUMN     "changefunctions_total" INTEGER NOT NULL;
