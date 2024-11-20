import { Injectable } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Injectable()
export class ConsumerService {
  
  @EventPattern('your-topic-name') // Nome do tópico que você deseja escutar
  async handleEvent(message: any) {
    console.log('Mensagem recebida:', message);
    // Processar a mensagem aqui
  }
}