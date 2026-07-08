import * as dotenv from 'dotenv';
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  });
}

function getCorsOrigins(): string[] {
  const raw =
    process.env.CORS_ORIGINS ??
    process.env.NEXTAUTH_URL ??
    'http://localhost:3000';
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // CSP disabled: this service serves JSON plus Swagger UI (which relies on
  // inline scripts); the frontend carries its own CSP.
  app.use(helmet({ contentSecurityPolicy: false }));

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

  app.enableCors({ origin: getCorsOrigins(), credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
