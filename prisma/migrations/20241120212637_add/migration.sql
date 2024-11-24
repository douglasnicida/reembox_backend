/*
  Warnings:

  - You are about to drop the `RAG_Approval` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RAG_Approval" DROP CONSTRAINT "RAG_Approval_approverId_fkey";

-- DropTable
DROP TABLE "RAG_Approval";

-- CreateTable
CREATE TABLE "RagApproval" (
    "id" SERIAL NOT NULL,
    "trainingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approverId" INTEGER NOT NULL,
    "remarks" TEXT,
    "modelInfo" TEXT,

    CONSTRAINT "RagApproval_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RagApproval" ADD CONSTRAINT "RagApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
