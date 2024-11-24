-- CreateTable
CREATE TABLE "RAG_Approval" (
    "id" SERIAL NOT NULL,
    "trainingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approverId" INTEGER NOT NULL,
    "remarks" TEXT,
    "modelInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RAG_Approval_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RAG_Approval" ADD CONSTRAINT "RAG_Approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
