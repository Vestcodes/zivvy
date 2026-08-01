import { Controller, Get, Res } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from './auth/decorators';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  @Get('/')
  @Public()
  root(@Res() res: Response) {
    return res.redirect('/docs');
  }

  @Get('/health')
  @Public()
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('/openapi.json')
  @Public()
  openApi(@Res() res: Response) {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const instance = httpAdapter.getInstance();

    // The OpenAPI document is stored on the app instance by the bootstrap function
    // Traverse up to find it from the express app's NestJS application reference
    const swaggerDocument =
      (instance as any)._openApiDocument ||
      (global as any).__openApiDocument;

    if (!swaggerDocument) {
      return res.status(503).json({
        error: 'OpenAPI document not yet available',
      });
    }

    return res.json(swaggerDocument);
  }
}
