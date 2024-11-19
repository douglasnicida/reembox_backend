import { Module } from '@nestjs/common';
import { JobTitleService } from './job-title.service';
import { JobTitleController } from './job-title.controller';
import { PrismaModule } from 'prisma/service/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [JobTitleController],
  providers: [JobTitleService],
  imports: [PrismaModule, AuthModule]
})
export class JobTitleModule {}
