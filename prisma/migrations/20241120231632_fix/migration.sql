/*
  Warnings:

  - You are about to drop the column `trainingDate` on the `RagApproval` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RagApproval" DROP COLUMN "trainingDate",
ADD COLUMN     "approvalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
