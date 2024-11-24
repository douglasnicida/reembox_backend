import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid'; // Para gerar IDs de correlação únicos

export interface KafkaMessage {
  key: string; // Chave única para identificar a mensagem
  value: {
    event_type: string; // Tipo do evento
    timestamp: number; // Timestamp da criação da mensagem
    data: any; // Dados específicos do evento
  };
  headers: Record<string, string>; // Headers adicionais
}

export interface KafkaData {
  event_type: string;
  data: any;
  source: string;
  headers?: Record<string ,string>
}

export async function sendMessage(kafkaClient: ClientKafka, topic: string, data: KafkaData) {
  const { event_type, data: kData, source, headers: metadata } = data

  const message: KafkaMessage = {
    key: uuidv4(),
    value: {
      event_type,
      timestamp: Date.now(),
      data: kData,
    },
    headers: {
      source,
      ...metadata,
    },
    
  };

  await firstValueFrom(kafkaClient.emit(topic, message));
}