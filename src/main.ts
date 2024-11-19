import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { AuthGuard } from './guards/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Criando uma instância do Reflector
  const reflector = new Reflector();

  // Aplica nossos validadores globalment
  app.useGlobalPipes(new ValidationPipe());

  // Aplica os nossos interceptadores globalmente
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  await app.listen(3333);
}
bootstrap();
