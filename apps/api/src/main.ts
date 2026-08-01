import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('v1', {
    exclude: ['/', 'docs', 'docs/(.*)', 'openapi.json', 'health'],
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Zivvy API')
    .setDescription(
      'Public REST API for Zivvy — your business data, programmatically. ' +
      'Every resource is tenant-scoped, tier-gated, and event-emitting. ' +
      'Subscribe to webhooks at /v1/webhooks or replay events from /v1/events.',
    )
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
    .addServer('https://integrate.zivvy.xyz', 'Production')
    .setContact('Zivvy', 'https://zivvy.xyz', 'support@zivvy.xyz')
    .setLicense('Terms of Service', 'https://zivvy.xyz/terms')
    .setExternalDoc('Integration guides', 'https://zivvy.xyz/integrations')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(4000);
  console.log('Zivvy API running on http://localhost:4000');
  console.log('Docs at http://localhost:4000/docs');
}
bootstrap();
