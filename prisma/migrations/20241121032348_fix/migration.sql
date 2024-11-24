/*
  Warnings:

  - Added the required column `customerId` to the `RagApproval` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RagApproval" ADD COLUMN     "customerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "RagApproval" ADD CONSTRAINT "RagApproval_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
