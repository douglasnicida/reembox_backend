import { Module } from '@nestjs/common';
import { AllocationService } from './allocation.service';
import { AllocationController } from './allocation.controller';
import { PrismaModule } from 'prisma/service/prisma.module';
import { UserModule } from '../user/user.module';
import { ProjectModule } from '../project/project.module';

@Module({
  controllers: [AllocationController],
  providers: [AllocationService],
  imports: [
    PrismaModule,
    UserModule,
    ProjectModule
  ]
})
export class AllocationModule {}
