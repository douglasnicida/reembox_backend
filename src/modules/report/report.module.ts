import { forwardRef, Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PrismaModule } from 'prisma/service/prisma.module';
import { UserModule } from '../user/user.module';
import { ExpenseModule } from '../expense/expense.module';

@Module({
  controllers: [ReportController],
  providers: [ReportService],
  imports: [PrismaModule, UserModule, forwardRef(() => ExpenseModule)],
  exports: [ReportService]
})
export class ReportModule {}
