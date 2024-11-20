import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PrismaModule } from 'prisma/service/prisma.module';

@Module({
  controllers: [ReportController],
  providers: [ReportService],
  imports: [PrismaModule],
  exports: [ReportService]
})
export class ReportModule {}
