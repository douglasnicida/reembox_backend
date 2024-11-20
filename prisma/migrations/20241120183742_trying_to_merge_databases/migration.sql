-- DropForeignKey
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_expenseId_fkey";

-- AlterTable
ALTER TABLE "Receipt" ALTER COLUMN "expenseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;
