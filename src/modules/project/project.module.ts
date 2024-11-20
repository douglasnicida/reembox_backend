import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaModule } from 'prisma/service/prisma.module';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  imports: [PrismaModule],
  exports: [ProjectService]
})
export class ProjectModule {}
