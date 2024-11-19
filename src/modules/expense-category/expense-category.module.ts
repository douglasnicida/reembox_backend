import { Module } from '@nestjs/common';
import { ExpenseCategoryService } from './expense-category.service';
import { ExpenseCategoryController } from './expense-category.controller';
import { PrismaModule } from 'prisma/service/prisma.module';

@Module({
  controllers: [ExpenseCategoryController],
  providers: [ExpenseCategoryService],
  imports: [PrismaModule],
  exports: [ExpenseCategoryService]
})
export class ExpenseCategoryModule {}
