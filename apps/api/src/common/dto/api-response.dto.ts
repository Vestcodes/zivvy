import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 0 })
  offset: number;
}

export class PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export class ErrorDetail {
  @ApiProperty({ example: 'NOT_FOUND' })
  code: string;

  @ApiProperty({ example: 'Item IT-001 not found' })
  message: string;

  @ApiProperty({ example: 404 })
  status: number;
}

export class ErrorResponse {
  @ApiProperty({ type: ErrorDetail })
  error: ErrorDetail;
}
