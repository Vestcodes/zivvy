import { SetMetadata } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public — bypasses API key authentication.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Mark a route as requiring API key auth and document it in Swagger.
 * Combines the Swagger @ApiSecurity decorator with metadata.
 */
export const ApiKeyAuth = () => applyDecorators(ApiSecurity('api-key'));
