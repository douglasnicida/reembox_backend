/*
  Warnings:

  - Added the required column `url` to the `Receipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "url" TEXT NOT NULL;
