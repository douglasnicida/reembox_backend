import { Module } from '@nestjs/common';
import { CostCenterService } from './cost-center.service';
import { CostCenterController } from './cost-center.controller';
import { PrismaModule } from 'prisma/service/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [CostCenterController],
  providers: [CostCenterService],
  imports: [PrismaModule, AuthModule],
  exports: [CostCenterService]
})
export class CostCenterModule {}
