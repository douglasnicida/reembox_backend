import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { MyResponse } from '@/interceptors/response.interceptor';
import { Pagination, PaginationParams } from '@/decorators/pagination.decorator';
import { AuthenticatedUser } from '@/decorators/auth-user.decorator';
import { PayloadStruct } from '@/interfaces/model_types';
import { FilterParams, QueryFilter } from '@/decorators/filter.decorator';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @MyResponse("Cliente criado com sucesso", HttpStatus.CREATED)
  async create(@Body() dto: CreateCustomerDto) {
    await this.customerService.create(dto);
  }

  @Get('')
  @MyResponse("Foram encontrados {length} clientes")
  findAll(
    @FilterParams() filter: QueryFilter, 
    @PaginationParams() pagination: Pagination, 
    @AuthenticatedUser() user: PayloadStruct
  ) {
    return this.customerService.findAll(pagination, filter, user.companyID)
  }

  @Get(':id')
  @MyResponse("Cliente obtido com sucesso")
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Patch(':id')
  @MyResponse("Cliente atualizado com sucesso")
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(+id, dto);
  }

  @Delete(':id')
  @MyResponse()
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}
