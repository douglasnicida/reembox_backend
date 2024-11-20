import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface QueryFilter {
  q?: string; 
  active?: boolean;
  endDate?: boolean;
  areAllocationsFinished?: boolean;
}

export const FilterParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): QueryFilter => {
    const request = ctx.switchToHttp().getRequest();
    const { q = '', active, areAllocationsFinished } = request.query;

    return {
      q,
      active: active !== undefined ? active === '1' : undefined,
      areAllocationsFinished
    };
  },
);