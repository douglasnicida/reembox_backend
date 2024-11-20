import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaProducerService } from './producer.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'my-app', // Identificador do cliente
            brokers: ['localhost:9092'], // Endereço do broker Kafka
          },
          consumer: {
            groupId: 'my-consumer-group', // ID do grupo do consumidor
          },
        },
      },
    ]),
  ],
  providers: [KafkaProducerService],
})
export class KafkaModule {}