/*
  Warnings:

  - You are about to drop the column `tag` on the `project` table. All the data in the column will be lost.
  - Added the required column `members` to the `project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project" DROP COLUMN "tag",
ADD COLUMN     "members" JSONB NOT NULL;
