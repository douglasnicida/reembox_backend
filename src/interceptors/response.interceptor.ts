import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface IMyResponse<T> {
  message?: string;
  status: number;
  payload?: T | T[];
}

export interface IPaginatedResponse<T> extends IMyResponse<T> {
  total?: number; // total de itens
  pages?: number; // total de páginas
  currentPage?: number; // página atual
  size?: number; // tamanho da página
}

// chave para o reflector
const RESPONSE_INTERCEPTOR = 'response-interceptor';

// utilitário para substituir args da mensagem
const formatMessage = (message: string, args: Record<string, any> = {}) => {  
  return message.replace(/\{(\w+)\}/g, (_, k) => args[k] ?? `{${k}}`);
};

// criando decorator
export const MyResponse = 
  (message?: string, status?: HttpStatus) => SetMetadata(RESPONSE_INTERCEPTOR, { status, message });

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const myResponse = this.reflector.get(RESPONSE_INTERCEPTOR, context.getHandler()) || {};
    const { message = "Recurso obtido com sucesso", status = HttpStatus.OK } = myResponse;

    return next.handle().pipe(
      map(data => {
        const response: IPaginatedResponse<T> = { 
          status, 
          message: formatMessage(message, data?.items ?? data)
        }

        // para endpoints de DELETE (deleção lógica)
        if (typeof data === 'boolean') {
          response.message = data ? 'Ativado com sucesso' : 'Desativado com sucesso'
        } else {
          response.payload = data
        }
          
        return response
      })
    );
  }
}
