/*
  Warnings:

  - You are about to drop the column `bu` on the `canyon_repo` table. All the data in the column will be lost.
  - Added the required column `members` to the `canyon_repo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tags` to the `canyon_repo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "canyon_repo" DROP COLUMN "bu",
ADD COLUMN     "members" JSONB NOT NULL,
ADD COLUMN     "tags" JSONB NOT NULL;
