/*
  Warnings:

  - Added the required column `language` to the `project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project" ADD COLUMN     "language" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "filepath" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "filepath_pkey" PRIMARY KEY ("id")
);
