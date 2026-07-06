import * as dotenv from 'dotenv';
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendOrigin = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('NexaOps API')
    .setDescription('The NexaOps Incident Management API description')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('incidents')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors({ origin: frontendOrigin, credentials: true });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
