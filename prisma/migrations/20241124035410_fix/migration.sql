/*
  Warnings:

  - You are about to drop the column `modelInfo` on the `ApprovalRAG` table. All the data in the column will be lost.
  - Added the required column `embeddingModel` to the `ApprovalRAG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `llmModel` to the `ApprovalRAG` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApprovalRAG" DROP COLUMN "modelInfo",
ADD COLUMN     "embeddingModel" VARCHAR(255) NOT NULL,
ADD COLUMN     "llmModel" VARCHAR(255) NOT NULL;
