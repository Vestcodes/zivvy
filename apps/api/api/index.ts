import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { AppModule } from '../dist/app.module';
import { GlobalExceptionFilter } from '../dist/common/filters/http-exception.filter';

const server = express();
let cachedApp: any;

async function bootstrap() {
  if (cachedApp) return server;
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('v1', {
    exclude: ['/', 'docs', 'docs/(.*)', 'openapi.json', 'health'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Zivvy API')
    .setDescription(
      'Public REST API for Zivvy — your business data, programmatically.',
    )
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
    .addServer('https://integrate.zivvy.xyz', 'Production')
    .setContact('Zivvy', 'https://zivvy.xyz', 'support@zivvy.xyz')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  (global as any).__openApiDocument = document;

  await app.init();
  cachedApp = app;
  return server;
}

export default async (req: any, res: any) => {
  const instance = await bootstrap();
  instance(req, res);
};
