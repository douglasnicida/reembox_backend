import { forwardRef, Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { PrismaModule } from 'prisma/service/prisma.module';
import { CostCenterModule } from '../cost-center/cost-center.module';
import { ProjectModule } from '../project/project.module';
import { ExpenseCategoryModule } from '../expense-category/expense-category.module';
import { ReportModule } from '../report/report.module';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService],
  imports: [
    PrismaModule, 
    CostCenterModule, 
    ProjectModule, 
    ExpenseCategoryModule, 
    forwardRef(() => ReportModule), 
  ],
  exports: [ExpenseService]
})
export class ExpenseModule {}
