/*
  Warnings:

  - Added the required column `lang` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `theme` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "lang" TEXT NOT NULL,
ADD COLUMN     "theme" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "system_setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_setting_pkey" PRIMARY KEY ("id")
);
