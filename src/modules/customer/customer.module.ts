import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { PrismaModule } from 'prisma/service/prisma.module';
import { KafkaModule } from '@/kafka/kafka.module';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService],
  imports: [
    PrismaModule,
    KafkaModule,
  ]
})
export class CustomerModule {}
