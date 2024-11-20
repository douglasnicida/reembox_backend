-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_approverId_fkey";

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "approverId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
