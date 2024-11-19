import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';

export interface Pagination {
  page: number;
  limit: number;
  size: number;
  offset: number;
}

export type Paginated<T> = {
  totalPages: number;
  totalItems: number;
  currentPage: number;
  size: number;
  items: any;
};

export const PaginationParams = createParamDecorator(
  (_data, ctx: ExecutionContext): Pagination => {
    const req: Request = ctx.switchToHttp().getRequest();
    const page = Number(req.query.page as string) - 1;
    const size = Number(req.query.size as string);

    const MAX_SIZE = 20;

    if (isNaN(page) || page < 0 || isNaN(size) || size < 0) {
      throw new BadRequestException('Os dados de paginação são inválidos');
    }

    if (size > MAX_SIZE) {
      throw new BadRequestException(
        `Uma página deve ter no máximo ${MAX_SIZE} elementos.`,
      );
    }

    const limit = size;
    const offset = page * limit;

    return { page, limit, size, offset };
  },
);