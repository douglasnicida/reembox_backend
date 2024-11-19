import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaModule } from 'prisma/service/prisma.module';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService],
  imports: [PrismaModule]
})
export class CompanyModule {}
