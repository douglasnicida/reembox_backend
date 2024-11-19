import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface QueryFilter {
  q?: string; 
  active?: boolean;
}

export const FilterParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): QueryFilter => {
    const request = ctx.switchToHttp().getRequest();
    const { q = '', active } = request.query;

    return {
      q,
      active: active !== undefined ? active === '1' : undefined
    };
  },
);