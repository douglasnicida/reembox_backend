/*
  Warnings:

  - You are about to drop the column `folderId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the `RagApproval` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RagApproval" DROP CONSTRAINT "RagApproval_approverId_fkey";

-- DropForeignKey
ALTER TABLE "RagApproval" DROP CONSTRAINT "RagApproval_customerId_fkey";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "folderId";

-- DropTable
DROP TABLE "RagApproval";

-- CreateTable
CREATE TABLE "ApprovalRAG" (
    "id" SERIAL NOT NULL,
    "approverId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "remarks" VARCHAR(255),
    "modelInfo" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalRAG_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApprovalRAG" ADD CONSTRAINT "ApprovalRAG_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRAG" ADD CONSTRAINT "ApprovalRAG_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
