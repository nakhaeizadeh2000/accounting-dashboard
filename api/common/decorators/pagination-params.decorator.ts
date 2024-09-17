// pagination.decorator.ts
import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export interface Pagination {
  page?: number;
  limit?: number;
}

export const PaginationParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Pagination => {
    const req = ctx.switchToHttp().getRequest();
    const page = parseInt(req.query.page as string) || 1; // Default to 0 if not provided
    const limit = parseInt(req.query.limit as string) || 10; // Default to 10 if not provided

    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      throw new BadRequestException('Invalid pagination params');
    }

    if (limit > 100) {
      throw new BadRequestException(
        'Invalid pagination params: Max limit is 100',
      );
    }

    return { page, limit };
  },
);
