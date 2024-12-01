import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { PrismaModule } from 'prisma/service/prisma.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService],
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'CUSTOMER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'customer',
            brokers: ['127.0.0.1:29092'],
          },
          consumer: {
            groupId: 'customer-consumer'
          }
        }
      },
    ]),
  ]
})
export class CustomerModule {}
