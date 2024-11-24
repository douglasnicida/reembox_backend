import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { PrismaModule } from 'prisma/service/prisma.module';

@Module({
  controllers: [RagController],
  providers: [RagService],
  imports: [PrismaModule],
  exports: [RagService]
})
export class RagModule {}
