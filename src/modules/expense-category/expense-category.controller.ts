import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ExpenseCategoryService } from './expense-category.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { AuthenticatedUser } from 'src/decorators/auth-user.decorator';
import { PayloadStruct } from '@/interfaces/model_types';
import { MyResponse } from '@/interceptors/response.interceptor';
import { Pagination, PaginationParams } from '@/decorators/pagination.decorator';
import { FilterParams, QueryFilter } from '@/decorators/filter.decorator';

@Controller('expense-categories')
export class ExpenseCategoryController {
  constructor(private readonly expenseCategoryService: ExpenseCategoryService) {}

  @Post()
  @MyResponse("Categoria de despesa criada com sucesso")
  create(@Body() dto: CreateExpenseCategoryDto, @AuthenticatedUser() authUser: PayloadStruct) {
    return this.expenseCategoryService.create(dto, authUser.companyID);
  }

  @Get(':id')
  @MyResponse("Categoria de despesa obtido com sucesso")
  findOne(@Param('id') id: string) {
    return this.expenseCategoryService.findOne(+id);
  }

  @Get()
  @MyResponse("Tipos de despesa obtidos com sucesso")
  async findAll(
    @FilterParams() filter: QueryFilter, 
    @PaginationParams() pagination: Pagination, 
    @AuthenticatedUser() user: PayloadStruct
  ) {  
    return this.expenseCategoryService.findAll(
      pagination, 
      filter, 
      user.companyID
    );
  }

  @Patch(':id')
  @MyResponse("Categoria de despesa atualizada com sucesso")
  update(@Param('id') id: string, @Body() dto: UpdateExpenseCategoryDto) {
    return this.expenseCategoryService.update(+id, dto);
  }

  @Delete(':id')
  @MyResponse()
  remove(@Param('id') id: string) {
    return this.expenseCategoryService.remove(+id);
  }
}
